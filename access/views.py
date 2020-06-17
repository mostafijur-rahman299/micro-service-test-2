from django.shortcuts import render, redirect

import requests

def login(request):
	return render(request, "login.html", {})

