import json
import pandas as pd
import os

file_paths = {
    "2000": "react-compiler-modify-metrics-2000-artists-2025-06-25T09-02-58.044Z.txt",
    "1000": "react-compiler-modify-metrics-1000-artists-2025-06-25T09-30-39.671Z.txt",
    "500": "react-compiler-modify-metrics-500-artists-2025-06-25T09-52-43.307Z.txt",
    "100": "react-compiler-modify-metrics-100-artists-2025-06-25T10-02-19.667Z.txt"
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

output_path = os.path.join(output_dir, "react_modify_artists_compiler_metrics_summary.csv")
df_results.to_csv(output_path, index=False)

print(f"Tabela zapisana do: {output_path}")
print(df_results)
