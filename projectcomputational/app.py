from flask import Flask, jsonify, render_template
import pandas as pd
import numpy as np
from monte import load_data, monte_carlo_simulation, summarize_results

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/run-simulation")
def run_simulation():
    
    

    df = load_data(file_path)
    losses = monte_carlo_simulation(df, num_simulations)
    results = summarize_results(losses)

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
