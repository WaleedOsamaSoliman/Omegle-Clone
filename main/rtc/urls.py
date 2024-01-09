from django.urls import path
from .views import index , rules , requests , virtualTest


urlpatterns = [
    path(r"" , index , name = 'index'),
    path(r"rules" , rules ,name = 'rules' ),
    path(r"requests" , requests , name = 'requests'),
    path(r"virtual-tests" , virtualTest , name = 'virtual-tests')

]