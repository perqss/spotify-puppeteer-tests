import json
import pandas as pd
import os

file_paths = {
    "2000": "solid-unfollow-signal-equals-false-performance-ALL-metrics-2000-artists-2025-06-19T18-23-32.912Z.txt",
    "1000": "solid-unfollow-signal-equals-false-performance-ALL-metrics-1000-artists-2025-06-21T10-45-06.779Z.txt",
    "500": "solid-unfollow-signal-equals-false-performance-ALL-metrics-500-artists-2025-06-21T11-20-52.327Z.txt",
    "100": "solid-unfollow-signal-equals-false-performance-ALL-metrics-100-artists-2025-06-21T11-07-50.261Z.txt"
}

results = []

def load_metrics(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f if line.strip()]

for label, path in file_paths.items():
    metrics = load_metrics(path)
    df = pd.DataFrame(metrics).iloc[:, 1:]

    results.append({
        "Framework": "Solid",
        "Components": int(label),
        "Performance": df["performance"].mean(),
        "TaskDuration": df["TaskDuration"].mean(),
        "ScriptDuration": df["ScriptDuration"].mean(),
        "JSHeapUsedSize_MB": df["JSHeapUsedSize"].mean() / (1024 * 1024),
        "JSHeapTotalSize_MB": df["JSHeapTotalSize"].mean() / (1024 * 1024)
    })

df_results = pd.DataFrame(results)
df_results = df_results.sort_values(by="Components")
df_results = df_results.round(3)

output_dir = "metrics"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, "solid_delete_artists_signal_equals_false_metrics_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
