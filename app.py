# Brigaa
# A sigaa bot app designed by Sóstenes Apollo
# https://brigaa.herokuapp.com/
# Github: https://github.com/sostenesapollo12

from flask import Flask, request, render_template,jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
import re
import os
import json
import pandas as pd

app = Flask(__name__)
CORS(app)
session = requests.Session()

url = {
	'login':'https://sigaa.ufpi.br/sigaa/logar.do?dispatch=logOn',
	'portal': 'https://sigaa.ufpi.br/sigaa/verPortalDiscente.do',
	'turma':'https://sigaa.ufpi.br/sigaa/ufpi/portais/discente/discente.jsf',
	'comprovante_solicitacoes': 'https://sigaa.ufpi.br/sigaa/ufpi/portais/discente/discente.jsf'
}

h = {
	"Upgrade-Insecure-Requests" : "1",
	"Content-Type": "application/x-www-form-urlencoded"
}

user = {'user.login': '', 'user.senha': ''}

@app.route("/getdata")
def get_turmas():
	#? Get user data from request
	user['user.login'] = request.args.get('login')	
	user['user.senha'] = request.args.get('senha')
	#? Logging 
	login_request = session.post(url['login'], params=user)
	login_soup = BeautifulSoup(login_request.text, 'html.parser')
	
	# print(login_request.text)
	# return login_request.text

	# if(len(login_soup.find_all("center")) > 0):		
		# return jsonify(error="Usuário ou senha incorretos")

	#? Redirects to homepage if have avaliação docente 
	home_request = session.post(url['portal'], params=user)
	home_soup = BeautifulSoup(home_request.text, 'html.parser')		
	
	# Board User Info
	user_board_soup = home_soup.find_all(id='agenda-docente')[1].table.find_all('tr')	  				
	userdata = {"user_data":{}}
	for item in user_board_soup:		
		if(len(item.find_all('td')) == 2):			
			userdata['user_data'][item.find_all('td')[0].text.replace(" ",'').replace(":",'')] = item.find_all('td')[1].text.replace("\n",'').replace('\t', ' ').replace(" ",'')
	userdata['user_data']['nome'] = home_soup.find("small").text
	userdata['Período Atual'] = home_soup.find(class_='periodo-atual').find('strong').text	
	userdata['img_src'] = "https://sigaa.ufpi.br"+home_soup.find(class_='foto').find('img')['src']
	
	# Second
	table = home_soup.find_all(id='turmas-portal')[0].table		
	data = pd.read_html(str(table))
	data = data[0]
	data = data.drop('Unnamed: 3', axis=1)
	data = data.drop('Chat', axis=1)
	data = data.drop('Chat.1', axis=1)
	data  = data.dropna()
	
	result = {}
	for index, row in data.iterrows():
		result[index] = dict(row)	

	return jsonify(result,userdata)

@app.route("/")
def home():	
	return render_template("login.html")

try:		
	print("Login...")			
	# login()
except Exception as e:
	print('Exception: ',str(e))	

if __name__  == "__main__" :	
	app.run(debug = False)