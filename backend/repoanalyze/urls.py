from django.urls import path, re_path
from . import views

# URL Conf
urlpatterns = [
    path('get_dependencies/', views.get_dependencies, name='get_dependencies'),
    path('get_commit_history/', views.get_commit_history, name='get_commit_history'),
    path('get_files_from_repository/', views.get_files_from_repository, name='get_files_from_repository'),
    path('generate_doc_strings/', views.generate_doc_strings, name='generate_doc_strings'),
    path('genDocument_from_docstr/', views.genDocument_from_docstr, name='genDocument_from_docstr'),
    path('download_documentation/', views.download_documentation, name='download_documentation'),
    path('remove_zip/', views.remove_zip, name='remove_zip'),
    # Serve generated documentation
    re_path(r'^docs/(?P<path>.*)$', views.serve_docs, name='serve_docs'),
]