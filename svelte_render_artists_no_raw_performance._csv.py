import json
import pandas as pd
import os

file_paths = {
    "50000": "svelte-no-raw-extra-performance-metrics-50000-artists-2025-06-15T14-04-44.031Z.txt",
    "10000": "svelte-no-raw-extra-performance-metrics-10000-artists-2025-06-15T14-16-11.314Z.txt",
    "1000": "svelte-no-raw-extra-performance-metrics-1000-artists-2025-06-15T14-53-42.269Z.txt",
    "100": "svelte-no-raw-extra-performance-metrics-100-artists-2025-06-15T14-55-24.150Z.txt"
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
        "Performance": df["performance"].mean(),
        "ScriptDuration": df["ScriptDuration"].mean(),
        "JSHeapUsedSize_MB": df["JSHeapUsedSize"].mean() / (1024 * 1024),
        "JSHeapTotalSize_MB": df["JSHeapTotalSize"].mean() / (1024 * 1024)
    })

df_results = pd.DataFrame(results)
df_results = df_results.sort_values(by="Components")
df_results = df_results.round(3)

output_dir = "metrics"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, "svelte_render_artists_metrics_performance_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
