# Generated by Django 5.1.1 on 2024-10-06 18:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_remove_leg_entered_lots_remove_port_rejection_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='leg',
            name='entered_price',
        ),
        migrations.RemoveField(
            model_name='leg',
            name='rejection_message',
        ),
        migrations.AddField(
            model_name='leg',
            name='order_message',
            field=models.TextField(blank=True, default=''),
        ),
    ]
