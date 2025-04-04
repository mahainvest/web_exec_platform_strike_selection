# Generated by Django 5.1.1 on 2024-10-08 17:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_remove_leg_entered_price_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='port',
            name='scrip_type',
            field=models.CharField(default='', max_length=100),
        ),
        migrations.AlterField(
            model_name='log',
            name='port',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='backend.port'),
        ),
    ]
