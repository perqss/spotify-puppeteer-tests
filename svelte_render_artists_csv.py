import json
import pandas as pd
import os

file_paths = {
    "50000": "svelte-no-raw-metrics-50000-artists-2025-06-14T17-14-48.614Z.txt",
    "10000": "svelte-no-raw-metrics-10000-artists-2025-06-14T17-23-37.116Z.txt",
    "1000": "svelte-no-raw-metrics-1000-artists-2025-06-14T17-29-17.020Z.txt",
    "100": "svelte-no-raw-metrics-100-artists-2025-06-14T17-30-04.064Z.txt"
}

results = []

def load_metrics(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f if line.strip()]

for label, path in file_paths.items():
    metrics = load_metrics(path)
    df = pd.DataFrame(metrics).iloc[:, 1:]

    results.append({
        "Framework": "Svelte",
        "Components": int(label),
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

output_path = os.path.join(output_dir, "svelte_render_artists_metrics_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
