from django.contrib import admin

from . import models

admin.site.register(models.User)
admin.site.register(models.Account)
admin.site.register(models.Strategy)
admin.site.register(models.Port)
admin.site.register(models.Leg)
admin.site.register(models.Order)
admin.site.register(models.Log)
admin.site.register(models.TradingViewAlert)