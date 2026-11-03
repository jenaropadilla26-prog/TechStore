"""Servidor opcional Flask de TechStore; la misma tienda funciona como HTML estático."""
from flask import Flask, render_template

app = Flask(__name__)


@app.get("/")
def inicio():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
