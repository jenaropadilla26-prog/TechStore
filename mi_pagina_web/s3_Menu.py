import boto3
import os
import re

# Nombre de tu bucket
BUCKET_NAME = 'jahp-pagina'  #(Nombre de Tu 'bucket)
EXPECTED_BUCKET_OWNER_ENV = "AWS_S3_EXPECTED_BUCKET_OWNER"

# Crear cliente S3
s3 = boto3.client('s3')


def _expected_bucket_owner():
    owner = os.environ.get(EXPECTED_BUCKET_OWNER_ENV, "")
    if not re.fullmatch(r"[0-9]{12}", owner):
        raise ValueError(
            f"Configura {EXPECTED_BUCKET_OWNER_ENV} con el ID de cuenta AWS "
            "de 12 dígitos propietario del bucket."
        )
    return owner


def subir_archivo():
    archivo_local = input("📁 Ingresa el nombre del archivo local a subir: ")
    if not os.path.exists(archivo_local):
        print("❌ El archivo no existe.")
        return
    nombre_destino = input("📤 Ingresa el nombre con que se guardará en S3: ")
    try:
        s3.upload_file(
            archivo_local,
            BUCKET_NAME,
            nombre_destino,
            ExtraArgs={"ExpectedBucketOwner": _expected_bucket_owner()},
        )
        print(f"✅ Archivo '{archivo_local}' subido exitosamente como '{nombre_destino}'")
    except Exception as e:
        print(f"❌ Error al subir: {e}")

def listar_archivos():
    try:
        respuesta = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            ExpectedBucketOwner=_expected_bucket_owner(),
        )
        if 'Contents' in respuesta:
            print("📂 Archivos en el bucket:")
            for objeto in respuesta['Contents']:
                print(" -", objeto['Key'])
        else:
            print("📭 El bucket está vacío.")
    except Exception as e:
        print(f"❌ Error al listar archivos: {e}")

def descargar_archivo():
    listar_archivos()
    nombre_archivo = input("📥 Ingresa el nombre del archivo a descargar: ")
    nombre_local = input("💾 Ingresa el nombre con que se guardará localmente: ")
    try:
        s3.download_file(
            BUCKET_NAME,
            nombre_archivo,
            nombre_local,
            ExtraArgs={"ExpectedBucketOwner": _expected_bucket_owner()},
        )
        print(f"✅ Archivo '{nombre_archivo}' descargado como '{nombre_local}'")
    except Exception as e:
        print(f"❌ Error al descargar: {e}")

def eliminar_archivo():
    listar_archivos()
    nombre_archivo = input("🗑️ Ingresa el nombre del archivo a eliminar: ")
    try:
        s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=nombre_archivo,
            ExpectedBucketOwner=_expected_bucket_owner(),
        )
        print(f"✅ Archivo '{nombre_archivo}' eliminado.")
    except Exception as e:
        print(f"❌ Error al eliminar: {e}")

def menu():
    while True:
        print("\n📌 Menú de opciones:")
        print("1. Subir archivo")
        print("2. Descargar archivo")
        print("3. Eliminar archivo")
        print("4. Listar archivos")
        print("5. Salir")

        opcion = input("Selecciona una opción (1-5): ")

        if opcion == '1':
            subir_archivo()
        elif opcion == '2':
            descargar_archivo()
        elif opcion == '3':
            eliminar_archivo()
        elif opcion == '4':
            listar_archivos()
        elif opcion == '5':
            print("👋 Saliendo del programa.")
            break
        else:
            print("❌ Opción inválida. Intenta de nuevo.")

# Ejecutar menú
if __name__ == '__main__':
    menu()
    menu()