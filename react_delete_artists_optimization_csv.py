import json
import pandas as pd
import os

file_paths = {
    "2000": "react-unfollow-memo-callback-performance-ALL-metrics-2000-artists-2025-06-19T20-35-51.100Z.txt",
    "1000": "react-unfollow-memo-callback-performance-ALL-metrics-1000-artists-2025-06-19T21-05-23.378Z.txt",
    "500": "react-unfollow-memo-callback-performance-ALL-metrics-500-artists-2025-06-19T21-15-09.486Z.txt",
    "100": "react-unfollow-memo-callback-performance-ALL-metrics-100-artists-2025-06-19T21-19-24.781Z.txt"
}

results = []

def load_metrics(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f if line.strip()]

for label, path in file_paths.items():
    metrics = load_metrics(path)
    df = pd.DataFrame(metrics).iloc[:, 1:]

    results.append({
        "Framework": "React",
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

output_path = os.path.join(output_dir, "react_delete_artists_optimization_metrics_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
