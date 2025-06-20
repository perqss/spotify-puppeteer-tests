import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def load_metrics(file_path):
    with open(file_path, 'r') as f:
        return [json.loads(line) for line in f if line.strip()]

file_paths = {
    "3000 artists": "svelte-unfollow-no-memo-ALL-metrics-3000-artists-2025-05-19T22-47-43.227Z.txt",
    "2000 artists": "svelte-unfollow-no-memo-ALL-metrics-2000-artists-2025-05-19T22-26-45.912Z.txt",
    "1000 artists": "svelte-unfollow-no-memo-ALL-metrics-1000-artists-2025-05-20T10-23-21.227Z.txt",
    "100 artists": "svelte-unfollow-no-memo-ALL-metrics-100-artists-2025-05-20T12-03-43.484Z.txt"
}

task_durations = {}
script_durations = {}

for label, path in file_paths.items():
    metrics = load_metrics(path)
    df = pd.DataFrame(metrics).iloc[:, 1:]
    task_durations[label] = df["TaskDuration"].mean()
    script_durations[label] = df["ScriptDuration"].mean()

# Dane do wykresu
labels = list(task_durations.keys())
x = np.arange(len(labels))  # pozycje na osi X
width = 0.35  # szerokość słupków

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, [task_durations[l] for l in labels], width, label='TaskDuration', color='skyblue')
bars2 = ax.bar(x + width/2, [script_durations[l] for l in labels], width, label='ScriptDuration', color='lightgreen')

# Oznaczenia
ax.set_ylabel('Average Duration (s)')
ax.set_title('Average TaskDuration and ScriptDuration for Svelte - Delete All Artists')
ax.set_xticks(x)
ax.set_xticklabels(labels, rotation=15)
ax.legend()
plt.tight_layout()

# Dodaj wartości na słupkach
for bars in (bars1, bars2):
    for bar in bars:
        height = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            height,
            f'{height:.3f}',
            ha='center', va='bottom'
        )

# Zapisz wykres
plt.savefig("svelte_task_vs_script_duration_delete_all_artists_avg.png")
