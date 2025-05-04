import json
import matplotlib.pyplot as plt
import pandas as pd

def load_metrics(file_path):
    with open(file_path, 'r') as f:
        return [json.loads(line) for line in f if line.strip()]

file_paths = {
    "50000 artists": "react-no-memo-metrics-50000-artists-2025-05-03T09-25-17.709Z.txt",
    "10000 artists": "react-no-memo-metrics-10000-artists-2025-05-03T11-06-26.035Z.txt",
    "1000 artists": "react-no-memo-metrics-1000-artists-2025-05-03T11-28-35.566Z.txt",
    "100 artists": "react-no-memo-metrics-100-artists-2025-05-04T03-10-44.690Z.txt"
}

average_durations = {}

for label, path in file_paths.items():
    metrics = load_metrics(path)
    df = pd.DataFrame(metrics).iloc[:, 1:]
    average_durations[label] = df["TaskDuration"].mean()

# Plotting
plt.figure(figsize=(10, 6))
plt.bar(average_durations.keys(), average_durations.values(), color='skyblue')
plt.ylabel("Average TaskDuration (s)")
plt.title("Average TaskDuration for React")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("react_taskduration_avg.png")
