from google.appengine.dist import use_library
use_library('django', '0.96')
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import mail
from django.utils import simplejson
import logging
import datetime
import time
import urllib
import os
import cgi
import base64
import re


#As seen in stack-overflow:
#http://stackoverflow.com/questions/1531501/json-serialization-of-google-app-engine-models
SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)

def to_dict(model):
  output = {}

  for key, prop in model.properties().iteritems():
    value = getattr(model, key)

    if value is None or isinstance(value, SIMPLE_TYPES):
      output[key] = value
    elif isinstance(value, datetime.date):
      # Convert date/datetime to ms-since-epoch ("new Date()").
      ms = time.mktime(value.utctimetuple()) * 1000
      ms += getattr(value, 'microseconds', 0) / 1000
      output[key] = int(ms)
    elif isinstance(value, db.Model):
      output[key] = to_dict(value)
    elif isinstance(value, users.User):
      output[key] = str(value)
    else:
      raise ValueError('cannot encode ' + repr(prop))
  return output

def to_json(model):
  return simplejson.dumps(to_dict(model))


#
# This defines the default page (Home/index/etc)
#
class StandardTemplate(webapp.RequestHandler):

  @staticmethod
  def getTemplateValuesBase(page):
    user = ChartUserModel.getCurrentUser()
    if (user):
      links = ['Home', 'About', 'Dashboard', 'Demo', 'Feedback', 'FAQ']
      template_values = {
          'logged_in'   : True,
          'logout_url'  : users.create_logout_url('/Home'),
          'logout_text' : 'Logout',
          'links'       : links,
          'nickname'    : user.nickname(),
          'page'        : page,
          'invoice'     : user.key(),
          'isSubscriber': user.isSubscriber()
      }
    else:
      links = ['Home', 'About', 'Feedback', 'FAQ', 'Register']
      template_values = {
          'logged_in'   : False,
          'logout_url'  : users.create_login_url('/Dashboard'),
          'logout_text' : 'Login',
          'links'       : links,
      }
    return template_values

  def get(self, page):
    template_values = self.getTemplateValuesBase(page)
    self.response.out.write(template.render('templates/'+page+'.html', template_values))

class SlashHandler(StandardTemplate):
  def get(self):
    StandardTemplate.get(self, 'Home')

class Custom404(StandardTemplate):
  def get(self):
    self.response.set_status(404)
    StandardTemplate.get(self, 'Home')

class DashboardTemplate(StandardTemplate):
  def get(self, page):
    user = ChartUserModel.getCurrentUser()
    if not user:
      #This will redirect the user to a login screen if they are not logged in.
      self.redirect(users.create_login_url('/Dashboard'))
    else:
      listOfCharts = ChartModel.all().filter('owner =', user.user)
      template_values = self.getTemplateValuesBase(page)
      template_values['charts'] = listOfCharts
      self.response.out.write(template.render('templates/'+page+'.html', template_values))

class FeedbackPost(StandardTemplate):
  def get(self, page):
    StandardTemplate.get(self, 'Feedback')
  def post(self, page):
    user = ChartUserModel.getCurrentUser()
    if user:
      author = user.nickname()+"<"+user.email()+">";
    else:
      author = 'anonymous';

    comments = self.request.get('content')

    # We are sending and receiving email from the same address.
    fromAddress = "radiantchart@radiantchart.com"
    toAddress = fromAddress

    mail.send_mail(sender=fromAddress,
                   to=toAddress,
                   subject='comments from: '+author,
                   body = comments)
    StandardTemplate.get(self, 'FeedbackThanks')

class ChartUserModel(db.Model):
  user = db.UserProperty(required = True)
  registerDateTime = db.DateTimeProperty(auto_now_add=True)
  subscribeStartDate = db.DateProperty()
  subscribeEndDate = db.DateProperty()

  def isSubscriber(self):
    return False

  def email(self):
    return self.user.email();

  def nickname(self):
    return self.user.nickname();

  def user_id(self):
    return self.user.user_id()

  def getChartCount(self, limit):
    return ChartModel.all().filter('owner =', self.user).count(limit)

  def tooManyCharts(self):
    #If the user isn't a subscriber, and has 4 or more charts, then
    # he already has too many charts.
    if (not self.isSubscriber()) and (self.getChartCount(4)>=4):
      return True;
    return False;

  @staticmethod
  def getCurrentUser():
    GAEUser = users.get_current_user();
    if (GAEUser):
      chartUser = ChartUserModel.getOrCreate(GAEUser)
      return chartUser
    else:
      return False

  @staticmethod
  def getOrCreate(GAEUser):
    myUser = ChartUserModel.get(GAEUser)
    if (myUser):
      return myUser
    else:
      myUser = ChartUserModel.create(GAEUser)
      return myUser

  @staticmethod
  def generateKeyName(GAEUser):
    return GAEUser.user_id()

  @staticmethod
  def create(GAEUser):
    myUser = ChartUserModel(key_name=ChartUserModel.generateKeyName(GAEUser), user=GAEUser)
    myUser.put()
    return myUser
    
  @staticmethod
  def get(GAEUser):
    return ChartModel.get_by_key_name(ChartUserModel.generateKeyName(GAEUser))
    

class ChartModel(db.Model):
  title = db.StringProperty(required = True)
  owner = db.UserProperty(required = True)
  public = db.BooleanProperty(default=False)
  picture = db.BlobProperty()
  chart = db.TextProperty()

  def edit_url(self):
    return '/Demo?keyname='+urllib.quote_plus(self.getKeyName())
    
  def image_url(self):
    return '/chartImage?keyname='+urllib.quote_plus(self.getKeyName())
    
  def getKeyName(self):
    return self.generateKeyName(self.title, self.owner)

  @staticmethod
  def generateKeyName(title, owner):
    return title+"!"+str(owner)

  @staticmethod
  def get_by_title_owner(title, owner):
    return ChartModel.get_by_key_name(ChartModel.generateKeyName(title, owner))

  @staticmethod
  def create(title, chart, owner, picture, public=False):
    return ChartModel(key_name=ChartModel.generateKeyName(title, owner), title=title, chart=chart, owner=owner, picture=picture, public=public)

    

class PublicChartHandler(webapp.RequestHandler):
  def get(self):
    keyname = self.request.get('keyname')
    if (keyname):
      chart = ChartModel.get_by_key_name(keyname)
      if (chart) and (chart.public):
        self.response.out.write(to_json(chart))
      else:
        self.response.out.write("INVALID KEY or ACCESS DENIED")
    else:
      listOfCharts = ChartModel.all().filter('public = ', True)
      for chart in listOfCharts:
        self.response.out.write("chartKey: " + chart.getKeyName() + "<br />\n")
      
class ChartImageHandler(webapp.RequestHandler):
  def get(self):
    user = ChartUserModel.getCurrentUser()
    if (user):
      keyname = self.request.get('keyname')
      if (keyname):
        #Select a chart by keyname
        chart = ChartModel.get_by_key_name(keyname)
        if (chart):
          #self.response.out.write(chart.to_xml())
          self.response.headers['Content-Type'] = "image/png"
          self.response.out.write(chart.picture)
        else:
          self.response.out.write("INVALID KEY")
    else: #No user
      self.response.out.write("NOT LOGGED IN")
      
class TempImageHandler(webapp.RequestHandler):
  dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
  def post(self, filename):
    img = self.request.get('picture')
    imgb64 = self.dataUrlPattern.match(img).group(2)

    if imgb64 is not None and len(imgb64) > 0:
      pictureIn = db.Blob(base64.b64decode(imgb64))
      self.response.out.write(pictureIn)
      self.response.headers['Content-Type'] = "image/png"
      #This is to force the browser to save the file response.
      self.response.headers['content-disposition'] = "attachment; filename="+filename
    else:
      self.response.set_status(400)

class ChartHandler(webapp.RequestHandler):
  dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')

  def get(self):
    user = ChartUserModel.getCurrentUser()
    if (user):
      keyname = self.request.get('keyname')
      if (keyname):
        #Select a chart by keyname
        chart = ChartModel.get_by_key_name(keyname)
        if (chart):
          #self.response.out.write(chart.to_xml())
          self.response.out.write(to_json(chart))
        else:
          self.response.out.write("INVALID KEY")
      else:
        #Return a list of charts.
        listOfCharts = ChartModel.all().filter('owner =', user.user)
        for chart in listOfCharts:
          self.response.out.write(' <a href="/Demo?keyname='+urllib.quote_plus(chart.getKeyName())+'">edit</a>')
          self.response.out.write(' <a href="/static/Demo.html?keyname='+urllib.quote_plus(chart.getKeyName())+'">edit (lite)</a>')
          self.response.out.write(" chartKey: " + chart.getKeyName())
          self.response.out.write(' <a href="chart?keyname='+urllib.quote_plus(chart.getKeyName())+'">link to JSON</a>')
          # We want to show the public link, even if the chart isn't public.  If it isn't public, then we want to note 
          # that in the link text (so we can still try to get to that page (which should return an invalid response)).
          self.response.out.write(' <a href="public?keyname='+urllib.quote_plus(chart.getKeyName())+'">');
          if (chart.public):
            self.response.out.write('public link</a><br />')
          else:
            self.response.out.write('public link (inaccessible)</a><br />')
    else: #No user
      self.response.out.write("NOT LOGGED IN")
      
  def post(self):
    user = ChartUserModel.getCurrentUser()
    if (user):
      titleIn = self.request.get('title')
      deleteCommand = self.request.get('deleteMe')

      chart = ChartModel.get_by_title_owner(titleIn, user.user)
      #We first deal with a delete request.
      if (deleteCommand):
        if (chart):
          chart.delete()
        # We want to return, whether or not we actually deleted a chart.
        return

      chartIn = self.request.get('chart')
      publicIn = ("public" == self.request.get('public'))
      img = self.request.get('picture')
      imgb64 = None
      if (img):
        imgb64 = self.dataUrlPattern.match(img).group(2)

      if imgb64 is not None and len(imgb64) > 0:
        pictureIn = db.Blob(base64.b64decode(imgb64))


      #We want this to be idempotent (requesting the same thing more than once won't change the data.)
      if (chart):
        #Update
        chart.public = publicIn
        chart.chart = db.Text(chartIn)
        chart.picture = pictureIn
        chart.put()
      else:
        #New

        # We would like to warn the user that they weren't able to save.
        if (user.tooManyCharts()):
          return
        chart = ChartModel.create(titleIn, chartIn, user.user, pictureIn, publicIn)
        chart.put()

      self.response.out.write(chart.getKeyName())
    else:
      self.response.out.write("NOT LOGGED IN")
        
#
# This defines a set of processing routines that deal with paypal
#
class PaypalEndPoint(webapp.RequestHandler):

    default_response_text = 'Nothing to see here'
    # verify_url = "https://www.paypal.com/cgi-bin/webscr"
    verify_url = "https://www.sandbox.paypal.com/cgi-bin/webscr"
    
    def do_post(self, url, args):
        return urllib.urlopen(url, urllib.urlencode(args)).read()
    
    def verify(self, data):
        args = {
            'cmd': '_notify-validate',
        }
        args.update(data)
        
        return self.do_post(self.verify_url, args) == 'VERIFIED'
    
    def default_response(self):
        return self.response.out.write(self.default_response_text)
    
    def post(self):
        r = None
        
        data = dict(self.request.POST.items())
        
        # We need to post that BACK to PayPal to confirm it
        if self.verify(data):
            r = self.process(data)
        else:
            r = self.process_invalid(data)
        
        if r:
            return r
        else:
            return self.default_response()
        
    def process(self, data):
        # Do something with the valid data.  Here is where we need to
        # look at the payer information and find a way to link it with
        # the their account.  Although we do receive payer information
        # there is nothing to say they didn't sign up with a different
        # email account/name/etc from what is in paypal.  The txn_id in
        # the response looks like what we need but we need to make
        # sure we know how to pass it to paypal in the first place...
        # from what I have read so far is looks like we can create
        # a hidden value with tx that would allow for this.
        #
        # At https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/e_howto_html_formbasics
        # it also looks like invoice is something that we can send
        # and it will be passed back to us.
    
        #user = ChartUserModel.get(data['invoice'])
        #if (user):
        #    s = 'PAYPAL SUCCESS' + data['invoice']
        #else: #No user
        #    s = "PAYPAL RECEIVED BUT NO USER: " + data['invoice']

        # For the moment
        # to play I am just going to send an email so that I can see
        # what the data looks like...
        fromAddress = "badwolftechnologies@gmail.com"
        toAddress = fromAddress
        mail.send_mail(sender="radiantchart@radiantchart.com",
                           to=toAddress,
                      subject='DONE',
                        body = data)
        return self.response.out.write("Great")
        
    def process_invalid(self, data):
        # Do something with invalid data (could be from anywhere) -
        # at the moment if this occurs we send an email to ourselves
        # to make sure we are aware and that something needs to be done
        fromAddress = "badwolftechnologies@gmail.com"
        toAddress = fromAddress
        mail.send_mail(sender="radiantchart@radiantchart.com",
                           to=toAddress,
                      subject='PAYPAL FAILURE',
                        body = data)
        return self.response.out.write("Fail")


urls = [
  ('/(Subscribe|Register|Home|About|FAQ|Demo)', StandardTemplate),
  ('/(Feedback)', FeedbackPost),
  ('/(Dashboard)', DashboardTemplate),
  ('/chart', ChartHandler),
  ('/public', PublicChartHandler),
  ('/chartImage', ChartImageHandler),
  ('/tempImage/(.*)', TempImageHandler),
  ('/', SlashHandler),
  (r'/endpoint$', PaypalEndPoint),
  ('/.*', Custom404)
  ]

app = webapp.WSGIApplication(urls, debug=True)

def main():
  run_wsgi_app(app)

if __name__ == "__main__":
  main()

