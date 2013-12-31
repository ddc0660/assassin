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
import json
from google.appengine.ext import db
from google.appengine.api import users


class Player(db.Model):
    name = db.StringProperty(required=True)
    role = db.StringProperty(required=True)
    email = db.EmailProperty()
    locationLat = 0.0
    locationLon = 0.0


class SlashHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'   
        obj = { 'success': 'some var', 
                'payload': 'some var',
              } 
        self.response.out.write(json.dumps(obj))

class Custom404(webapp2.RequestHandler):
    def get(self):
        self.response.set_status(404)


class JoinGameHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')
    def post(self, page):
        user = Player(name = self.request.get('name'),
                      role = "assassin",
                      email = db.Email(self.request.get('email')),
                      locationLat = self.request.get('locationLat'),
                      locationLon = self.request.get('locationLon'))
        user.put()

class UpdateLocationHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.write('Hello world!')
    def post(self, page):
        users = db.GqlQuery("SELECT * FROM Player WHERE email IN :1",
                            [self.request.get('email')])
  
        for user in users:
            user.locationLat = self.request.get('locationLat')
            user.locationLon = self.request.get('locationLon')
            db.put(user)


class FindNearbyHandler(webapp2.RequestHandler):
    def get(self):
        assassin = db.GqlQuery("SELECT * FROM Player WHERE email IN :1",
                               [db.Email(self.request.get('email'))])
        users = db.GqlQuery("SELECT * FROM Player")
        self.response.write('Assassin: ')
        self.response.write(self.request.get('email'))
        for user in users:
            self.response.write(user.name)
            self.response.write(', ')


urls = [
  ('/JoinGame', JoinGameHandler),
  ('/UpdateLocation', UpdateLocationHandler),
  ('/FindNearby', FindNearbyHandler),
  ('/', SlashHandler),
  ('/.*', Custom404)
  ]

application = webapp2.WSGIApplication(urls, debug=True)
