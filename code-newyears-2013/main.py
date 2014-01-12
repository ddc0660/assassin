#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import datetime
import urllib2
import json
from math import sin, cos, sqrt, asin, atan2, radians
from google.appengine.ext import db
from google.appengine.api import users


class Player(db.Model):
    name = db.StringProperty(required=True)
    role = db.StringProperty(required=True)
    email = db.EmailProperty()
    locationLat = db.FloatProperty()
    locationLon = db.FloatProperty()


class SlashHandler(webapp2.RequestHandler):
    def get(self):
        obj = { 'success': 'some var', 
                'payload': 'some var',
              } 
        self.response.headers['Content-Type'] = 'application/javascript'
        self.response.out.write("%s(%s)" % (urllib2.unquote(self.request.get('callback')), json.dumps(obj)))

class Custom404(webapp2.RequestHandler):
    def get(self):
        self.response.set_status(404)


class JoinGameHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')
    def post(self):
        user = Player(name = self.request.get('name'),
                      role = "assassin",
                      email = db.Email(self.request.get('email')),
                      locationLat = float(self.request.get('locationLat')),
                      locationLon = float(self.request.get('locationLon')))
        user.put()
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    def options(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers.add_header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept")
        self.response.headers['Content-Type'] = 'text/csv'
        #self.response.out.write(self.dump_csv())

class UpdateLocationHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.write('Hello world!')
    def post(self):
        users = db.GqlQuery("SELECT * FROM Player WHERE email IN :1",
                            [self.request.get('email')])
  
        for user in users:
            user.locationLat = float(self.request.get('locationLat'))
            user.locationLon = float(self.request.get('locationLon'))
            db.put(user)
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    def options(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers.add_header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept")
        self.response.headers['Content-Type'] = 'text/csv'
        #self.response.out.write(self.dump_csv())


class FindNearbyHandler(webapp2.RequestHandler):
    def isPlayerInRange(self, lat1, lon1, lat2, lon2, distInMeters):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees) using Haversine formula
        """
        # convert decimal degrees to radians 
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

        # haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a),sqrt(1-a)) 

        # Get the distance as meters
        dist = c * 6367009
        dm = float(distInMeters)
        return (dist <= dm)

    def get(self):
        assassinQuery = db.GqlQuery("SELECT * FROM Player WHERE email = :1",
                               db.Email(self.request.get('email')))
        userQuery = db.GqlQuery("SELECT * FROM Player")
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers.add_header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept")
        self.response.write('Assassin: ')
        self.response.write(self.request.get('email'))
        self.response.write('<BR>')
        for assassin in assassinQuery:
            assassinLat = assassin.locationLat
            assassinLon = assassin.locationLon

        for user in userQuery:
            if self.isPlayerInRange(assassinLat, assassinLon, user.locationLat, user.locationLon, self.request.get('distance')):
                self.response.write(user.name)
                self.response.write(', ')

    def options(self):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers.add_header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept")
        #self.response.headers['Content-Type'] = 'text/csv'
        #self.response.out.write(self.dump_csv())


urls = [
  ('/(?i)JoinGame', JoinGameHandler),
  ('/(?i)UpdateLocation', UpdateLocationHandler),
  ('/(?i)FindNearby', FindNearbyHandler),
  ('/', SlashHandler),
  ('/.*', Custom404)
  ]

application = webapp2.WSGIApplication(urls, debug=True)
