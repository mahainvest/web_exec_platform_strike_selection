from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("current-user/", views.current_user, name="current_user"),
    path("expiries/<str:scrip>/<str:ins_type>/", views.get_expiries, name="get_expiries"),
    path("tv-alert/", views.trading_view_alert, name="trading_view_alert"),

    path("strategies/", views.get_strategies, name="get_strategies"),
    path("strategies/add/", views.add_strategy, name="add_strategy"),
    path("strategies/delete/<int:id>/", views.delete_strategy, name="delete_strategy"),
    path("strategies/export/", views.export_strategies, name="export_strategies"),
    path("strategies/import/", views.import_strategies, name="import_strategies"),

    path("ports/", views.get_ports, name="get_ports"),
    path("ports/add/", views.add_port, name="add_port"),
    path("ports/edit/<int:id>/", views.edit_port, name="edit_port"),
    path("ports/delete/<int:id>/", views.delete_port, name="delete_port"),
    path("ports/start/<int:id>/", views.start_port, name="start_port"),
    path("ports/stop/<int:id>/", views.stop_port, name="stop_port"),
    path("ports/execute/<int:id>/", views.execute_port, name="execute_port"),
    path("ports/squareoff/<int:id>/", views.squareoff_port, name="squareoff_port"),
    path("ports/export/", views.export_ports, name="export_ports"),
    path("ports/import/", views.import_ports, name="import_ports"),

    path("accounts/", views.get_accounts, name="get_accounts"),
    path("accounts/add/", views.add_account, name="add_account"),
    # path("broker-token/<int:id>/", views.broker_token, name="broker_token"),
    # path("set-access-token/", views.set_access_token, name="set_access_token"),

    path("master-logs/", views.get_master_logs, name="get_master_logs"),
    path("master-logs/clear/", views.clear_master_logs, name="clear_master_logs"),

    path("strategy/start/<int:strategy_num>/", views.start_strategy, name="start_strategy"),
    path("strategy/stop/<int:strategy_num>/", views.stop_strategy, name="stop_strategy"),
    path("strategy/status/<int:strategy_num>/", views.strategy_status, name="strategy_status")
]