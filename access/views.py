from django.shortcuts import render, redirect

import requests


def login(request):
	return render(request, "login.html", {})


def product_crud(request):
	return render(request, "product_crud.html", {})