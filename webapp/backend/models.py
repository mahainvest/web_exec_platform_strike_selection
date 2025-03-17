from .constants import *
from django.db import models
from django.utils import timezone


class User(models.Model):
    username = models.CharField(max_length=10)
    password = models.CharField(max_length=40)

    def __str__(self):
        return self.username


class Account(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="accounts")

    name = models.CharField(max_length=30, default="")
    type = models.CharField(max_length=30, default="MULTITRADE", choices=BROKERS)

    # Multitrade Details
    api_key = models.CharField(max_length=1000, default="")
    api_secret = models.CharField(max_length=1000, default="")
    root_url = models.CharField(max_length=1000, default="")
    ws_root_url = models.CharField(max_length=1000, default="")

    # access_token = models.CharField(max_length=1000, default="")
    # last_login_date = models.DateField(default=timezone.now)
    # initiated_login_process = models.BooleanField(default=False)

    lots_multiplier = models.FloatField(default=0)


class Strategy(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="strategies", null=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="strategies", null=True)

    name = models.CharField(max_length=20, default="")
    max_loss = models.FloatField(default=0)
    lots_multiplier = models.FloatField(default=0)


class Port(models.Model):
    name = models.CharField(max_length=100, default="")
    strategy = models.ForeignKey(Strategy, on_delete=models.CASCADE, related_name="ports")

    scrip = models.CharField(max_length=100, default="CRUDEOIL")
    scrip_type = models.CharField(max_length=100, default="FUT")
    start_time = models.TimeField(default=timezone.now)
    stop_time = models.TimeField(default=timezone.now)
    squareoff_time = models.TimeField(default=timezone.now)
    combined_sl = models.FloatField(default=0)
    combined_target = models.FloatField(default=0)
    to_re_execute = models.BooleanField(default=True)
    trading_mode = models.CharField(max_length=10, default="Paper", choices=TRADING_MODES)

    lots_multiplier_set = models.FloatField(default=1)
    is_re_executed_port = models.BooleanField(default=False)
    execute_button = models.BooleanField(default=False)
    execute_button_lots = models.FloatField(default=0)
    squareoff_button = models.BooleanField(default=False)
    stop_button = models.BooleanField(default=False)
    combined_exit_done = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Leg(models.Model):
    name = models.CharField(max_length=100, default="")
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name="legs", null=True)

    lots = models.IntegerField(default=1)
    ins_type = models.CharField(max_length=20, default="CE", choices=INS_TYPES)
    strike_distance = models.IntegerField(default=0)
    actual_strike = models.IntegerField(default=0)
    expiry = models.DateField(default=timezone.now)
    trade_type = models.CharField(max_length=20, default="BUY", choices=TRADE_TYPES)
    order_type = models.CharField(max_length=20, default="MARKET", choices=ORDER_TYPES)
    limit_pct = models.FloatField(default=0)
    num_modifications = models.IntegerField(default=0)
    modification_wait_time = models.FloatField(default=0)
    sl_on = models.CharField(max_length=20, default="PREMIUM", choices=SL_ON)
    sl = models.CharField(default="0", max_length=10)
    target = models.CharField(default="0", max_length=10)

    status = models.CharField(max_length=100, default="no_position")
    entered_ins = models.CharField(max_length=100, default="")
    entered_token = models.CharField(max_length=100, default="")
    entered_strike = models.IntegerField(default=0)
    entered_underlying_price = models.FloatField(default=0)
    ltp = models.FloatField(default=0)
    running_pnl = models.FloatField(default=0.0)
    booked_pnl = models.FloatField(default=0.0)

    entry_order_id = models.CharField(default="", max_length=100)
    exit_order_id = models.CharField(default="", max_length=100)
    entry_order_type = models.CharField(max_length=20, default="MARKET", choices=ORDER_TYPES)
    exit_order_type = models.CharField(max_length=20, default="MARKET", choices=ORDER_TYPES)
    entry_order_message = models.TextField(default="", blank=True)
    exit_order_message = models.TextField(default="", blank=True)
    entry_order_status = models.CharField(default="", max_length=20)
    exit_order_status = models.CharField(default="", max_length=20)
    entry_num_modifications_done = models.IntegerField(default=0)
    exit_num_modifications_done = models.IntegerField(default=0)
    entry_filled_qty = models.IntegerField(default=0)
    exit_filled_qty = models.IntegerField(default=0)
    entry_executed_price = models.FloatField(default=0)
    exit_executed_price = models.FloatField(default=0)


# class AccountLeg(models.Model):
#     leg = models.ForeignKey(Leg, on_delete=models.CASCADE, related_name="account_legs")
#     account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="account_legs")

#     entry_order_id = models.CharField(default="", max_length=100)
#     order_status = models.CharField(default="", max_length=20)
#     filled_qty = models.IntegerField(default=0)
#     executed_price = models.FloatField(default=0)
#     rejection_message = models.TextField(default="")

#     running_pnl = models.FloatField(default=0.0)
#     booked_pnl = models.FloatField(default=0.0)


class Order(models.Model):
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name="orders", null=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="orders", null=True)

    timestamp = models.DateTimeField(default=timezone.now)
    instrument = models.CharField(max_length=500, default="")
    trade = models.CharField(max_length=100, default="BUY", choices=TRADE_TYPES)
    qty = models.IntegerField(default=0)
    order_type = models.CharField(max_length=100, default="MARKET", choices=ORDER_TYPES)
    price = models.FloatField(default=0)


class Log(models.Model):
    port = models.ForeignKey("Port", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)

    timestamp = models.DateTimeField(auto_now=True)
    text = models.TextField(default="")
    level = models.CharField(max_length=100, choices=LEVELS)

    def __str__(self):
        return f"{self.timestamp}\t[{self.level}]\t{self.text}"


class TradingViewAlert(models.Model):
    strategy = models.ForeignKey("Strategy", on_delete=models.CASCADE, related_name="alerts")
    port = models.ForeignKey("Port", on_delete=models.CASCADE, related_name="alerts")

    status = models.CharField(max_length=20, default="pending")
    symbol = models.CharField(max_length=50, default="")
    type = models.CharField(max_length=50, default="")
    lots = models.FloatField(default=0)

    def __str__(self):
        return f"{self.symbol}\t{self.type}\t{self.status}"