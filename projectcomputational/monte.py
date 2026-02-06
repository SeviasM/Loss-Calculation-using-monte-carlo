import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


def load_data(file_path):
    """Load loan data from a specified Excel file into a DataFrame."""
    try:
        return pd.read_excel(file_path)
    except FileNotFoundError:
        raise FileNotFoundError("Excel file not found")


def monte_carlo_simulation(df, num_simulations):
    """
    Run Monte Carlo simulation for loan portfolio defaults.
    Each simulation produces ONE total portfolio loss value.
    """
    portfolio_losses = []

    for _ in range(num_simulations):
        portfolio_loss = 0.0

        for _, row in df.iterrows():
            if np.random.rand() < row["Default_Probability"]:
                loss = row["Loan_Amount"] * (1 - row["Recovery_Rate"])
                portfolio_loss += loss

        portfolio_losses.append(portfolio_loss)

    return np.array(portfolio_losses)


def summarize_results(portfolio_losses):
    """Summarize simulation results with statistics."""
    sorted_losses = np.sort(portfolio_losses)
    n = len(sorted_losses)
    
    return {
        "num_simulations": int(n),
        "mean_loss": float(np.mean(portfolio_losses)),
        "median_loss": float(np.median(portfolio_losses)),
        "std_loss": float(np.std(portfolio_losses)),
        "min_loss": float(np.min(portfolio_losses)),
        "max_loss": float(np.max(portfolio_losses)),
        "var_95": float(sorted_losses[int(n * 0.95)]),
        "var_99": float(sorted_losses[int(n * 0.99)]),
        "losses": portfolio_losses.tolist()
    }


def plot_results(portfolio_losses):
    """Plot results locally (for desktop use)."""
    cumulative_losses = np.cumsum(portfolio_losses)

    plt.figure(figsize=(10, 6))
    plt.plot(cumulative_losses, label="Cumulative Portfolio Losses")
    plt.xlabel("Simulation Number")
    plt.ylabel("Cumulative Loss")
    plt.title("Cumulative Portfolio Losses Over Monte Carlo Simulations")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    file_path = r"C:\Users\Sevias\Desktop\projectcomputational\loans_data.xlsx"
    num_simulations = 1000

    df = load_data(file_path)
    losses = monte_carlo_simulation(df, num_simulations)
    summary = summarize_results(losses)
    
    print(f"Mean Loss: ${summary['mean_loss']:,.2f}")
    print(f"VaR 95%: ${summary['var_95']:,.2f}")
    
    plot_results(losses)