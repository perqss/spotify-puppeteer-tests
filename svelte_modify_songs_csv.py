import json
import pandas as pd
import os

file_paths = {
    "200": "svelte-state-modify-metrics-200-songs-2025-07-02T13-36-34.993Z.txt",
    "100": "svelte-state-modify-metrics-100-songs-2025-07-02T13-50-29.408Z.txt",
    "50": "svelte-state-modify-metrics-50-songs-2025-07-02T14-11-25.567Z.txt",
    "10": "svelte-state-modify-metrics-10-songs-2025-07-02T14-22-20.245Z.txt"
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

output_path = os.path.join(output_dir, "svelte_modify_songs_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
