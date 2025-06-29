from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_view, name='core_test'),
    path('todos/', views.todo_list, name='todo_list'),
    path('todos/<int:pk>/', views.todo_detail, name='todo_detail'),
]
