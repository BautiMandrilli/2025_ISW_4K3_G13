import pytest
from datetime import datetime, timedelta


def comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago):
    if not usuario:
        return {"estado": "error", "mensaje": "Solo usuarios registrados pueden comprar entradas"}
    if cantidad > 10:
        return {"estado": "error", "mensaje": "No puedes comprar más de 10 entradas"}
    if forma_pago not in ("efectivo", "tarjeta_credito"):
        return {"estado": "error", "mensaje": "Debes seleccionar una forma de pago válida"}
    try:
        fecha = datetime.strptime(fecha_visita, "%Y-%m-%d")
    except Exception:
        return {"estado": "error", "mensaje": "Formato de fecha inválido"}
    hoy = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    if fecha < hoy:
        return {"estado": "error", "mensaje": "No se puede seleccionar una fecha pasada"}
    if fecha.weekday() == 0:
        return {"estado": "error", "mensaje": "El parque está cerrado los lunes"}
    if fecha.strftime("%m-%d") in ["12-25", "01-01"]:
        return {"estado": "error", "mensaje": "El parque está cerrado en esa fecha especial"}
    if len(edades) != cantidad:
        return {"estado": "error", "mensaje": "Debes indicar la edad de cada visitante"}
    total = 0
    precios = []
    for edad in edades:
        if edad < 3:
            precio = 0
        elif edad < 15 or edad >= 60:
            precio = (10000 if tipo_pase == "VIP" else 5000) // 2
        else:
            precio = 10000 if tipo_pase == "VIP" else 5000
        precios.append(precio)
        total += precio
    return {
        "estado": "ok",
        "mensaje": "Compra realizada",
        "cantidad": cantidad,
        "total": total,
        "precios": precios
    }

def test_compra_exitosa_regular():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    cantidad = 2
    edades = [20, 30]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "ok"
    assert resultado["cantidad"] == 2
    assert resultado["total"] == 5000 * 2

def test_compra_exitosa_vip_menor_15():
    usuario = "visitante_registrado"
    dias = 1
    while True:
        fecha = datetime.now() + timedelta(days=dias)
        if fecha.weekday() != 0:
            break
        dias += 1
    fecha_visita = fecha.strftime("%Y-%m-%d")
    cantidad = 1
    edades = [10]
    tipo_pase = "VIP"
    forma_pago = "tarjeta_credito"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    print(resultado)
    assert resultado["estado"] == "ok"
    assert resultado["total"] == 5000

def test_compra_exitosa_mayor_60():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [65]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "ok"
    assert resultado["total"] == 2500

def test_compra_menor_3_no_paga():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [2]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "ok"
    assert resultado["total"] == 0

def test_compra_con_fecha_cerrada_navidad():
    usuario = "visitante_registrado"
    fecha_visita = "2025-12-25"
    cantidad = 3
    edades = [20, 25, 30]
    tipo_pase = "VIP"
    forma_pago = "tarjeta_credito"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "cerrado" in resultado["mensaje"].lower()

def test_compra_con_fecha_cerrada_ano_nuevo():
    usuario = "visitante_registrado"
    proximo_ano = datetime.now().year + 1
    fecha_visita = f"{proximo_ano}-01-01"
    cantidad = 2
    edades = [20, 25]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "cerrado" in resultado["mensaje"].lower()

def test_compra_con_fecha_lunes():
    usuario = "visitante_registrado"
    hoy = datetime.now()
    dias_hasta_lunes = (0 - hoy.weekday() + 7) % 7
    if dias_hasta_lunes == 0:
        dias_hasta_lunes = 7
    fecha_lunes = (hoy + timedelta(days=dias_hasta_lunes)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [25]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_lunes, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "lunes" in resultado["mensaje"].lower()

def test_compra_con_fecha_pasada():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [25]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "pasada" in resultado["mensaje"].lower()

def test_compra_mas_de_10_entradas():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    cantidad = 11
    edades = [20]*11
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "más de 10" in resultado["mensaje"].lower()

def test_compra_sin_usuario_registrado():
    usuario = None
    fecha_visita = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [25]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "registrado" in resultado["mensaje"].lower()

def test_compra_sin_forma_pago():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    cantidad = 1
    edades = [25]
    tipo_pase = "regular"
    forma_pago = ""
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "forma de pago" in resultado["mensaje"].lower()

def test_compra_sin_edades():
    usuario = "visitante_registrado"
    fecha_visita = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    cantidad = 2
    edades = [25]
    tipo_pase = "regular"
    forma_pago = "efectivo"
    resultado = comprar_entradas(usuario, fecha_visita, cantidad, edades, tipo_pase, forma_pago)
    assert resultado["estado"] == "error"
    assert "edad" in resultado["mensaje"].lower()
