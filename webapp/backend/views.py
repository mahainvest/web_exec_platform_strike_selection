import os
import io
import jwt
import pytz
import json
import traceback
import pandas as pd
import requests as r
import datetime as dt
from pathlib import Path
import datetime
# from django.db.models import Q
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect, csrf_exempt

# Models
from .models import User, Account, Strategy, Port, Leg, TradingViewAlert, Log

env = os.environ.get("ALGO_ENV")


@csrf_exempt
@require_http_methods(["POST"])
def trading_view_alert(request):
    req_headers = request.META

    x_forwarded_for_value = req_headers.get('HTTP_X_FORWARDED_FOR')

    if x_forwarded_for_value:
        ip = x_forwarded_for_value.split(',')[-1].strip()
    else:
        ip = req_headers.get('REMOTE_ADDR')

    print(ip)

    # if ip in ["52.89.214.238", "34.212.75.30", "54.218.53.128", "52.32.178.7"]:
    if 1 == 1:
        print(request.body)

        data = json.loads(request.body.decode("ascii"))
        print(data)

        if isinstance(data, dict):
            alerts = [data]
        elif isinstance(data, list):
            alerts = data
        try:
            for _alert in alerts:
                strategy = Strategy.objects.get(name=_alert["STAG"])
                port = Port.objects.get(name=_alert["Port"])

                # alert = TradingViewAlert.objects.create(
                #     strategy=strategy,
                #     port=port,

                #     status="pending",
                #     symbol=_alert["SYMBOL"],
                #     type=_alert["TYPE"],
                #     lots=_alert["LOTS"]
                # )
                # alert.save()

                if "STRIKE" in _alert:
                    strike = _alert["STRIKE"]
                    
                    port_strike_name = f"{port.name}_STRIKE_{strike}" 
                    port_copy = None
                    
                    try:
                        port_copy = Port.objects.get(name=port_strike_name, strategy=strategy) 
                    except Port.DoesNotExist:
                        port_copy = Port.objects.create(
                            name=port_strike_name,
                            strategy=strategy,
                            scrip=port.scrip,
                            scrip_type=port.scrip_type,
                            start_time=port.start_time,
                            stop_time=port.stop_time,
                            squareoff_time=port.squareoff_time,
                            combined_sl=port.combined_sl,
                            combined_target=port.combined_target,
                            to_re_execute=port.to_re_execute,
                            trading_mode=port.trading_mode,
                            lots_multiplier_set=port.lots_multiplier_set,
                            is_re_executed_port=port.is_re_executed_port,
                            execute_button=False,
                            execute_button_lots=port.execute_button_lots,
                            squareoff_button=False,
                            stop_button=False,
                            combined_exit_done=False
                        )
                        
                        for i, original_leg in enumerate(port.legs.all()):
                            leg_copy = Leg.objects.create(
                                name=original_leg.name,
                                port=port_copy,
                                lots=original_leg.lots,
                                ins_type=original_leg.ins_type,
                                strike_distance=0,
                                actual_strike=int(strike),
                                expiry=original_leg.expiry,
                                trade_type=original_leg.trade_type,
                                order_type=original_leg.order_type,
                                limit_pct=original_leg.limit_pct,
                                num_modifications=original_leg.num_modifications,
                                modification_wait_time=original_leg.modification_wait_time,
                                sl_on=original_leg.sl_on,
                                sl=original_leg.sl,
                                target=original_leg.target,
                                status="no_position"
                            )
                        
                        Log.objects.create(
                            port=port_copy,
                            text=f"Created new port with strike {strike} from original port {port.name}",
                            level="INFO"
                        )
                    
                    alert = TradingViewAlert.objects.create(
                        strategy=strategy,
                        port=port_copy,
                        status="pending",
                        symbol=_alert["SYMBOL"],
                        type=_alert["TYPE"],
                        lots=_alert["LOTS"]
                    )
                else:
                    alert = TradingViewAlert.objects.create(
                        strategy=strategy,
                        port=port,
                        status="pending",
                        symbol=_alert["SYMBOL"],
                        type=_alert["TYPE"],
                        lots=_alert["LOTS"]
                    )
                
                alert.save()
        except:
            print(traceback.format_exc())

    else:
        print(f"Invalid IP: {ip}")

    return HttpResponse("thanks")


# ------------------------------------------------------------------------------
# Utilities


def conditional_decorator(dec, condition):
    def decorator(func):
        if not condition:
            # Return the function unchanged, not decorated.
            return func
        return dec(func)
    return decorator


def protected(request, token_sent_in="HEADER"):
    if token_sent_in == "HEADER":
        token_string = request.headers["Authorization"].split()

        if len(token_string) != 2:
            return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

        if token_string[0] != "jwt-token":
            return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

        token = bytes(token_string[1], "utf-8")

    elif token_sent_in == "GET":
        token_string = request.GET.get("access-token", "")
        token = bytes(token_string, "UTF-8")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms="HS256")
    except (jwt.exceptions.ExpiredSignatureError, jwt.exceptions.InvalidSignatureError, jwt.exceptions.DecodeError):
        return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

    try:
        user = User.objects.get(username=payload["username"], password=payload["password"])
    except User.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Username"}, status=400)

    return [payload, user]


@require_http_methods(["GET"])
def get_expiries(request, scrip, ins_type):
    if ins_type in ("CE", "PE"):
        ins_type = "OPT"

    td = dt.datetime.now(tz=pytz.timezone("Asia/Kolkata"))
    path = Path(f"./master_contracts/{td.strftime('%Y%m%d')}.csv")

    if path.exists():
        print("Yes")
        master_contract = pd.read_csv(path)

    else:
        print("No")

        for child in Path("./master_contracts/").iterdir():
            if child.is_file():
                child.replace(path)

        res = r.get("https://api.kite.trade/instruments")
        master_contract = pd.read_csv(io.StringIO(res.text))

        master_contract.to_csv(path)

    mc = master_contract[(master_contract["segment"].isin([f"NFO-{ins_type}", f"MCX-{ins_type}"]))]
    mc = mc[mc["name"] == scrip]
    mc["expiry"] = pd.to_datetime(mc["expiry"])
    mc = mc.sort_values(by="expiry")
    expiries_list = list(mc.expiry.unique())

    el = {}

    for expiry in expiries_list:
        month = expiry.month
        if month not in el.keys():
            el[month] = [expiry]
        else:
            el[month].append(expiry)

    el_to_ret = {}
    subtract_fig = list(el.keys())[0] - 1
    cur_year = td.year

    for m in list(el.keys())[:3]:
        if el[m][0].year == cur_year:
            month_index = m - subtract_fig
        elif el[m][0].year == cur_year + 1:
            month_index = m + (12 - subtract_fig) - 1

        if len(el[m]) == 1:
            el_to_ret[f"M{month_index}"] = el[m][0]
        else:
            for week_index in range(len(el[m][:-1])):
                el_to_ret[f"M{month_index}W{week_index+1}"] = el[m][week_index]

            el_to_ret[f"M{month_index}"] = el[m][-1]

    for k, v in el_to_ret.items():
        el_to_ret[k] = v.to_pydatetime().date()

    print(el_to_ret)
    return JsonResponse({"type": "success", "message": f"Fetched {scrip} {ins_type} Expiries", "data": el_to_ret}, status=200)


# ------------------------------------------------------------------------------


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def login_view(request):
    data = json.loads(request.body)

    username = data["username"]
    password = data["password"]

    try:
        User.objects.get(username=username, password=password)

    except User.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Credentials"})

    key = settings.SECRET_KEY
    payload = {"username": username, "password": password, "exp": dt.datetime.now(pytz.UTC) + dt.timedelta(hours=5)}

    token = jwt.encode(payload, key, algorithm="HS256")
    print(token)

    return JsonResponse({"type": "success", "jwtToken": token, "message": "Logged in", "username": username}, status=200)


@require_http_methods(["GET"])
def current_user(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        return JsonResponse({"type": "success", "message": "Valid User", "username": res[0]["username"].capitalize()})


@require_http_methods(["GET"])
def get_strategies(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        strategies_list = []
        strategies = user.strategies.all().order_by("-id")

        for strategy in strategies:
            # accounts = strategy.accounts.all()
            # total_pnl = {}

            # for account in accounts:
            total_pnl = 0

            for port in strategy.ports.all():
                for leg in port.legs.all():
                    # acc_leg = leg.account_legs.get(account=account)

                    total_pnl = round(total_pnl + leg.running_pnl + leg.booked_pnl, 2)

                # total_pnl[account.name] = round(acc_running_pnl + acc_booked_pnl, 2)

            strategies_list.append({
                "id": strategy.id,
                # "accounts": ", ".join([acc.name for acc in strategy.accounts.all()]),
                "account": strategy.account.name,
                "name": strategy.name,
                "maxLoss": strategy.max_loss,
                "lotsMultiplier": strategy.lots_multiplier,
                "totalPnl": total_pnl
            })

        return JsonResponse({"type": "success", "message": "Fetched Strategies", "data": strategies_list}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def add_strategy(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        data = json.loads(request.body)["data"]
        print(data)

        acc = Account.objects.get(name=data["account"])

        strategy = Strategy.objects.create(
            user=user,
            account=acc,
            name=data["name"],
            max_loss=data["maxLoss"],
            lots_multiplier=data["lotsMultiplier"]
        )
        strategy.save()

        # for _acc in data["accounts"]:
        #     acc = Account.objects.get(name=_acc)
        #     strategy.accounts.add(acc)

        # strategy.save()

        return JsonResponse({"type": "success", "message": "Added Strategy"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def delete_strategy(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        strategy = Strategy.objects.get(pk=id)
        strategy.delete()

        return JsonResponse({"type": "success", "message": "Deleted Strategy"}, status=200)


@require_http_methods(["GET"])
def export_strategies(request):
    res = protected(request, "GET")

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        strategies_list = []
        strategies = user.strategies.all().order_by("-id")

        for strategy in strategies:
            strategies_list.append({
                "id": strategy.id,
                # "accounts": ", ".join([acc.name for acc in strategy.accounts.all()]),
                "account": strategy.account.name,
                "name": strategy.name,
                "maxLoss": strategy.max_loss,
                "lotsMultiplier": strategy.lots_multiplier
            })

        response = HttpResponse(json.dumps(strategies_list), content_type="application/json")
        response["Content-Disposition"] = "attachment; filename=strategies.json"

        return response


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def import_strategies(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]
        f = request.FILES.get("file")

        try:
            data = f.read()
            strategies_list = json.loads(data)

            for _str in strategies_list:
                acc = Account.objects.get(name=_str["account"])

                strategy = Strategy.objects.create(
                    user=user,
                    account=acc,
                    name=_str["name"],
                    max_loss=_str["maxLoss"],
                    lots_multiplier=_str["lotsMultiplier"]
                )
                strategy.save()

                # for _acc in data["accounts"]:
                #     acc = Account.objects.get(name=_acc)
                #     strategy.accounts.add(acc)

                # strategy.save()

        except Exception as e:
            return JsonResponse({"type": "error", "message": f"Error {e} came while importing strategies file"}, status=400)

        return JsonResponse({"type": "success", "message": "Added Strategies"}, status=200)


@require_http_methods(["GET"])
def get_ports(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        ports_list = []
        strategies = user.strategies.all().order_by("-id")

        for strategy in strategies:
            ports = strategy.ports.all().order_by("-id")

            for port in ports:
                # running_pnl = {}
                # booked_pnl = {}

                logs = []
                orders = []
                legs_list = []

                # for acc in strategy.accounts.all():
                running_pnl = 0
                booked_pnl = 0

                for leg in port.legs.all():
                    # acc_leg = leg.account_legs.get(account=acc)

                    running_pnl = round(running_pnl + leg.running_pnl, 2)
                    booked_pnl = round(booked_pnl + leg.booked_pnl, 2)

                    # running_pnl[acc.name] = running_pnl
                    # booked_pnl[acc.name] = booked_pnl

                for log in port.logs.all().order_by("-id"):
                    logs.append({
                        "timestamp": log.timestamp.astimezone(tz=pytz.timezone("Asia/Kolkata")).strftime("%d/%m %H:%M:%S"),
                        "text": log.text,
                        "level": log.level
                    })

                for order in port.orders.all().order_by("-id"):
                    orders.append({
                        "accountName": order.account.name,
                        "timestamp": order.timestamp.astimezone(tz=pytz.timezone("Asia/Kolkata")).strftime("%d/%m %H:%M:%S"),
                        "instrument": order.instrument,
                        "trade": order.trade,
                        "qty": order.qty,
                        "orderType": order.order_type,
                        "price": order.price
                    })

                for leg in port.legs.all().order_by("-id"):
                    # acc_legs = []

                    # for j, acc_leg in leg.account_legs.all():
                    #     acc_legs.append({
                    #         "accountName": acc_leg.account.name,

                    #         "entryOrderID": acc_leg.entry_order_id,
                    #         "orderStatus": acc_leg.order_status,
                    #         "filledQty": acc_leg.filled_qty,
                    #         "executedPrice": acc_leg.executed_price,
                    #         "rejectionMessage": acc_leg.rejection_message,

                    #         "runningPnl": acc_leg.running_pnl,
                    #         "bookedPnl": acc_leg.booked_pnl
                    #     })

                    legs_list.append({
                        "id": leg.id,
                        "name": leg.name,

                        "lots": leg.lots,
                        "insType": leg.ins_type,
                        "strikeDistance": leg.strike_distance,
                        "expiry": leg.expiry.strftime("%d-%m-%Y"),
                        "tradeType": leg.trade_type,
                        "orderType": leg.order_type,
                        "limitPct": leg.limit_pct,
                        "numModifications": leg.num_modifications,
                        "modificationWaitTime": leg.modification_wait_time,
                        "slOn": leg.sl_on,
                        "sl": leg.sl,
                        "target": leg.target,

                        "status": leg.status,
                        "enteredIns": leg.entered_ins,
                        "enteredToken": leg.entered_token,
                        "enteredStrike": leg.entered_strike,
                        "enteredUnderlyingPrice": leg.entered_underlying_price,
                        "ltp": leg.ltp,
                        "runningPnl": leg.running_pnl,
                        "bookedPnl": leg.booked_pnl,

                        "entryOrderID": leg.entry_order_id,
                        "exitOrderID": leg.exit_order_id,
                        "entryOrderType": leg.entry_order_type,
                        "exitOrderType": leg.exit_order_type,
                        "entryOrderMessage": leg.entry_order_message,
                        "exitOrderMessage": leg.exit_order_message,
                        "entryOrderStatus": leg.entry_order_status,
                        "exitOrderStatus": leg.exit_order_status,
                        "entryNumModificationsDone": leg.entry_num_modifications_done,
                        "exitNumModificationsDone": leg.exit_num_modifications_done,
                        "entryFilledQty": leg.entry_filled_qty,
                        "exitFilledQty": leg.exit_filled_qty,
                        "entryExecutedPrice": leg.entry_executed_price,
                        "exitExecutedPrice": leg.exit_executed_price,

                        # "error": leg.order_message not in ("sucess", "") or leg.order_status == "Reject"
                        # "acc_legs": acc_legs
                    })

                ports_list.append({
                    "id": port.id,
                    "name": port.name,
                    "strategyName": strategy.name,

                    "scrip": port.scrip,
                    "scripType": port.scrip_type,
                    "startTime": port.start_time,
                    "stopTime": port.stop_time,
                    "squareoffTime": port.squareoff_time,
                    "combinedSL": port.combined_sl,
                    "combinedTarget": port.combined_target,
                    "toReExecute": "Yes" if port.to_re_execute else "No",
                    "tradingMode": port.trading_mode,

                    "lotsMultiplierSet": port.lots_multiplier_set,
                    "isReExecutedPort": port.is_re_executed_port,
                    "executeButton": port.execute_button,
                    "executeButtonLots": port.execute_button_lots,
                    "squareoffButton": port.squareoff_button,
                    "stopButton": port.stop_button,

                    "runningPnl": running_pnl,
                    "bookedPnl": booked_pnl,

                    "logs": logs,
                    "orders": orders,
                    "legs": legs_list
                })

        return JsonResponse({"type": "success", "message": "Fetched Ports", "data": ports_list}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def add_port(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        data = json.loads(request.body)["data"]
        print(data)

        strategy = user.strategies.get(name=data["strategyName"])

        port = Port.objects.create(
            name=data["name"],
            strategy=strategy,

            scrip=data["scrip"],
            scrip_type=data["scripType"],
            start_time=dt.datetime.strptime(data["startTime"], "%H:%M").time(),
            stop_time=dt.datetime.strptime(data["stopTime"], "%H:%M").time(),
            squareoff_time=dt.datetime.strptime(data["squareoffTime"], "%H:%M").time(),
            combined_sl=data["combinedSL"],
            combined_target=data["combinedTarget"],
            to_re_execute=True if data["toReExecute"] == "Yes" else False,
            trading_mode=data["tradingMode"]
        )

        for leg_num in range(len(data["legs"])):
            leg_data = data["legs"][leg_num]

            leg = Leg.objects.create(
                name="Leg_" + str(leg_num+1),
                port=port,

                lots=leg_data["lots"],
                ins_type=leg_data["insType"],
                strike_distance=leg_data["strikeDistance"],
                expiry=dt.datetime.strptime(data["expiry"], "%Y-%m-%d").date(),
                trade_type=leg_data["tradeType"],
                order_type=leg_data["orderType"],
                limit_pct=leg_data["limitPct"],
                num_modifications=leg_data["numModifications"],
                modification_wait_time=leg_data["modificationWaitTime"],
                sl_on=leg_data["slOn"],
                sl=leg_data["sl"],
                target=leg_data["target"]
            )
            leg.save()

        port.save()

        return JsonResponse({"type": "success", "message": "Added Port with all legs"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def edit_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        data = json.loads(request.body)["data"]
        print(data)

        port = Port.objects.get(pk=id)

        port.scrip = data["scrip"]
        port.start_time = dt.datetime.strptime(data["startTime"], "%H:%M:%S").time()
        port.stop_time = dt.datetime.strptime(data["stopTime"], "%H:%M:%S").time()
        port.squareoff_time = dt.datetime.strptime(data["squareoffTime"], "%H:%M:%S").time()
        port.combined_sl=data["combinedSL"]
        port.combined_target=data["combinedTarget"]
        port.trading_mode = data["tradingMode"]

        for leg_data in data["legs"]:
            leg = port.legs.get(name=leg_data["name"])

            leg.lots = leg_data["lots"]
            leg.ins_type = leg_data["insType"]
            leg.expiry = dt.datetime.strptime(data["expiry"], "%Y-%m-%d").date()
            leg.trade_type = leg_data["tradeType"]
            leg.order_type = leg_data["orderType"]
            leg.num_modifications = leg_data["numModifications"]
            leg.modification_wait_time = leg_data["modificationWaitTime"]
            leg.sl_on = leg_data["slOn"]
            leg.sl = leg_data["sl"]
            leg.target = leg_data["target"]

            leg.save()

        port.save()

        return JsonResponse({"type": "success", "message": "Saved Port"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def start_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        port = Port.objects.get(pk=id)
        port.stop_button = False
        port.save()

        return JsonResponse({"type": "success", "message": "Resumed Port"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def stop_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        port = Port.objects.get(pk=id)
        port.stop_button = True
        port.save()

        return JsonResponse({"type": "success", "message": "Paused Port"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def execute_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        data = json.loads(request.body)["data"]
        print(data)

        port = Port.objects.get(pk=id)
        port.execute_button = True
        port.execute_button_lots = data["lots"]
        port.save()

        return JsonResponse({"type": "success", "message": f"Executed Port with Lots Multiplier: {data['lots']}"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def squareoff_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        port = Port.objects.get(pk=id)
        port.squareoff_button = True
        port.save()

        return JsonResponse({"type": "success", "message": "Squared off Port"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def delete_port(request, id):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        port = Port.objects.get(pk=id)
        port.delete()

        return JsonResponse({"type": "success", "message": "Deleted Port"}, status=200)


@require_http_methods(["GET"])
def export_ports(request):
    res = protected(request, "GET")

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        ports_list = []
        strategies = user.strategies.all().order_by("-id")

        for strategy in strategies:
            ports = strategy.ports.all().order_by("-id")

            for port in ports:
                # running_pnl = {}
                # booked_pnl = {}

                legs_list = []

                for leg in port.legs.all().order_by("-id"):
                    # acc_legs = []

                    # for j, acc_leg in leg.account_legs.all():
                    #     acc_legs.append({
                    #         "accountName": acc_leg.account.name,

                    #         "entryOrderID": acc_leg.entry_order_id,
                    #         "orderStatus": acc_leg.order_status,
                    #         "filledQty": acc_leg.filled_qty,
                    #         "executedPrice": acc_leg.executed_price,
                    #         "rejectionMessage": acc_leg.rejection_message,

                    #         "runningPnl": acc_leg.running_pnl,
                    #         "bookedPnl": acc_leg.booked_pnl
                    #     })

                    legs_list.append({
                        "id": leg.id,
                        "name": leg.name,

                        "lots": leg.lots,
                        "insType": leg.ins_type,
                        "strikeDistance": leg.strike_distance,
                        "expiry": leg.expiry.strftime("%d-%m-%Y"),
                        "tradeType": leg.trade_type,
                        "orderType": leg.order_type,
                        "limitPct": leg.limit_pct,
                        "numModifications": leg.num_modifications,
                        "modificationWaitTime": leg.modification_wait_time,
                        "slOn": leg.sl_on,
                        "sl": leg.sl,
                        "target": leg.target,
                        # "acc_legs": acc_legs
                    })

                ports_list.append({
                    "id": port.id,
                    "name": port.name,
                    "strategyName": strategy.name,

                    "scrip": port.scrip,
                    "scripType": port.scrip_type,
                    "startTime": port.start_time.strftime("%H:%M"),
                    "stopTime": port.stop_time.strftime("%H:%M"),
                    "squareoffTime": port.squareoff_time.strftime("%H:%M"),
                    "combinedSL": port.combined_sl,
                    "combinedTarget": port.combined_target,
                    "toReExecute": port.to_re_execute,
                    "tradingMode": port.trading_mode,
                    "legs": legs_list
                })

        print(ports_list)

        response = HttpResponse(json.dumps(ports_list), content_type="application/json")
        response["Content-Disposition"] = "attachment; filename=ports.json"

        return response


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def import_ports(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]
        f = request.FILES.get("file")

        try:
            data = f.read().decode("ascii")
            ports_list = json.loads(data)

            for _port in ports_list:
                strategy = user.strategies.get(name=_port["strategyName"])

                port = Port.objects.create(
                    name=_port["name"],
                    strategy=strategy,

                    scrip=_port["scrip"],
                    scrip_type=_port["scripType"],
                    start_time=dt.datetime.strptime(_port["startTime"], "%H:%M").time(),
                    stop_time=dt.datetime.strptime(_port["stopTime"], "%H:%M").time(),
                    squareoff_time=dt.datetime.strptime(_port["squareoffTime"], "%H:%M").time(),
                    combined_sl=_port["combinedSL"],
                    combined_target=_port["combinedTarget"],
                    to_re_execute=_port["toReExecute"],
                    trading_mode=_port["tradingMode"]
                )

                for leg_data in _port["legs"]:
                    leg = Leg.objects.create(
                        name=leg_data["name"],
                        port=port,

                        lots=leg_data["lots"],
                        ins_type=leg_data["insType"],
                        strike_distance=leg_data["strikeDistance"],
                        expiry=dt.datetime.strptime(leg_data["expiry"], "%d-%m-%Y").date(),
                        trade_type=leg_data["tradeType"],
                        order_type=leg_data["orderType"],
                        limit_pct=leg_data["limitPct"],
                        num_modifications=leg_data["numModifications"],
                        modification_wait_time=leg_data["modificationWaitTime"],
                        sl_on=leg_data["slOn"],
                        sl=leg_data["sl"],
                        target=leg_data["target"]
                    )
                    leg.save()

                port.save()

        except Exception as e:
            return JsonResponse({"type": "error", "message": f"Error {e} came while importing ports file"}, status=400)

        return JsonResponse({"type": "success", "message": "Added Ports with all legs"}, status=200)


@require_http_methods(["GET"])
def get_accounts(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]
        accounts = user.accounts.all().order_by("-id")
        accounts_list = []

        for account in accounts:
            running_pnl = 0
            booked_pnl = 0

            # strategies = account.strategy_set.all()

            for strategy in account.strategies.all():
                for port in strategy.ports.all():
                    for leg in port.legs.all():
                        # acc_leg = leg.account_legs.get(account=account)

                        running_pnl = round(running_pnl + leg.running_pnl, 2)
                        booked_pnl = round(booked_pnl + leg.booked_pnl, 2)

            accounts_list.append({
                "id": account.id,
                "name": account.name,
                "type": account.type,
                "apiKey": account.api_key,
                "apiSecret": account.api_secret,
                "rootURL": account.root_url,
                "wsRootURL": account.ws_root_url,
                "lotsMultiplier": account.lots_multiplier,

                "totalPnl": round(running_pnl + booked_pnl, 2),
            })

        return JsonResponse({"type": "success", "message": "Fetched Accounts", "data": accounts_list}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def add_account(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        user = res[1]

        data = json.loads(request.body)["data"]
        print(data)

        acc = Account.objects.create(
            user=user,

            name=data["name"],
            type=data["type"],

            api_key=data["apiKey"],
            api_secret=data["apiSecret"],
            root_url=data["rootURL"],
            ws_root_url=data["wsRootURL"],

            lots_multiplier=data["lotsMultiplier"]
        )
        acc.save()

        return JsonResponse({"type": "success", "message": "Added new Account"}, status=200)


@require_http_methods(["GET"])
def get_master_logs(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        logs_list = []

        for log in Log.objects.filter(port=None).order_by("-id"):
            logs_list.append({
                "timestamp": log.timestamp.astimezone(tz=pytz.timezone("Asia/Kolkata")).strftime("%d/%m %H:%M:%S"),
                "text": log.text,
                "level": log.level
            })

        return JsonResponse({"type": "success", "message": "Fetched Master Logs", "data": logs_list}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def clear_master_logs(request):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        for log in Log.objects.filter(port=None):
            log.delete()

        return JsonResponse({"type": "success", "message": "Cleared Master Logs"}, status=200)


# @require_http_methods(["GET"])
# def manual_broker_login(request, id):
#     res = protected(request)

#     if isinstance(res, JsonResponse):
#         return res

#     else:
#         def on_failure(_broker):
#             _broker.initiated_login_process = True
#             _broker.save()

#             brokers_to_disable_initiated_login_process = Broker.objects.filter(~Q(pk=id)).all()

#             for broker_to_disable in brokers_to_disable_initiated_login_process:
#                 broker_to_disable.initiated_login_process = False
#                 broker_to_disable.save()

#         broker = Broker.objects.get(pk=id)

#         if broker.type == "ZERODHA":
#             kite = KiteConnect(broker.key_1)

#             if broker.last_login_date == dt.date.today():
#                 kite.set_access_token(broker.access_token)

#             try:
#                 profile = kite.profile()
#                 print(f"PROFILE: {profile}")

#                 return JsonResponse({"type": "success", "message": "Already Logged in"}, status=200)

#             except Exception:
#                 on_failure(broker)
#                 return JsonResponse({"type": "generateToken", "url": kite.login_url()})

#         elif broker.type == "SHOONYA":
#             if broker.last_login_date == dt.date.today():
#                 api = NorenApi(host="https://api.shoonya.com/NorenWClientTP/", websocket="wss://api.shoonya.com/NorenWSTP/")

#                 api._NorenApi__username = broker.key_1
#                 api._NorenApi__accountid = broker.key_1
#                 api._NorenApi__password = broker.key_2
#                 api._NorenApi__susertoken = broker.access_token

#             else:
#                 api = None # To cause exception, so that it opens login window

#             try:
#                 res = api.get_holdings()

#                 if not isinstance(res, list):
#                     raise Exception

#                 return JsonResponse({"type": "success", "message": "Logged in to Finvasia"}, status=200)

#             except Exception:
#                 on_failure(broker)
#                 return JsonResponse({"type": "takeTOTP"})


# @conditional_decorator(csrf_exempt, env != "prod")
# @conditional_decorator(csrf_protect, env == "prod")
# @require_http_methods(["POST"])
# def set_access_token(request):
#     res = protected(request)

#     if isinstance(res, JsonResponse):
#         return res

#     else:
#         body = json.loads(request.body)
#         broker = Broker.objects.get(initiated_login_process=True)

#         if broker.type == "ZERODHA":
#             kite = KiteConnect(broker.key_1)
#             data = kite.generate_session(body["requestToken"], broker.key_2)

#             broker.access_token = data["access_token"]
#             broker.last_login_date = dt.date.today()
#             broker.initiated_login_process = False
#             broker.save()

#             return JsonResponse({"type": "success", "message": "Logged in to Zerodha"}, status=200)

#         elif broker.type == "SHOONYA":
#             try:
#                 api = NorenApi(host="https://api.shoonya.com/NorenWClientTP/", websocket="wss://api.shoonya.com/NorenWSTP/")
#                 res = api.login(broker.key_1, broker.key_2, body["requestToken"], broker.vendor_code, broker.app_key, broker.imei)

#                 print(f"RESPONSE: {res}")
#                 token = res["susertoken"]

#             except Exception as e:
#                 print(e)
#                 traceback.print_exc()
#                 return JsonResponse({"type": "error", "message": "Error came while logging in to Finvasia, try again"}, status=400)

#             broker.access_token = token
#             broker.last_login_date = dt.date.today()
#             broker.save()

#             return JsonResponse({"type": "success", "message": "Logged in to Shoonya"}, status=200)


@require_http_methods(["GET"])
def strategy_status(request, strategy_num):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        res = os.system(f"supervisorctl status strategy{strategy_num}")
        print(f"Strategy #{strategy_num} Status: {res}")

        return JsonResponse({"type": "success", "message": f"Fetched Strategy #{strategy_num} status", "data": res}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def start_strategy(request, strategy_num):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        res = os.system(f"supervisorctl start strategy{strategy_num}")
        print(f"Strategy #{strategy_num} started: {res}")

        return JsonResponse({"type": "success", "message": f"Started Strategy #{strategy_num}"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def stop_strategy(request, strategy_num):
    res = protected(request)

    if isinstance(res, JsonResponse):
        return res

    else:
        res = os.system(f"supervisorctl stop strategy{strategy_num}")
        print(f"Strategy #{strategy_num} stopped: {res}")

        return JsonResponse({"type": "success", "message": f"Stopped Strategy #{strategy_num}"}, status=200)
