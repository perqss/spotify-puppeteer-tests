import json
import pandas as pd
import os

file_paths = {
    "50000": "svelte-artist-profile-state-raw-50000-2025-07-08T12-48-18.764Z.txt",
    "10000": "svelte-artist-profile-state-raw-10000-2025-07-08T13-33-37.247Z.txt",
    "1000": "svelte-artist-profile-state-raw-1000-2025-07-08T13-38-16.329Z.txt",
    "100": "svelte-artist-profile-state-raw-100-2025-07-08T13-39-43.515Z.txt"
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

output_path = os.path.join(output_dir, "svelte_artist_profile_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
