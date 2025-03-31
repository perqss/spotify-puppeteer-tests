import json
import matplotlib.pyplot as plt
import pandas as pd

def load_metrics(file_path):
    with open(file_path, 'r') as f:
        return [json.loads(line) for line in f if line.strip()]

svelte_metrics = load_metrics('svelte-metrics-100000-artists-2025-03-30T23-37-12.631Z.txt')
react_metrics = load_metrics('react-metrics-100000-artists-2025-03-31T00-22-36.707Z.txt')

svelte_df = pd.DataFrame(svelte_metrics).iloc[:, 1:]
react_df = pd.DataFrame(react_metrics).iloc[:, 1:]

columns = ["TaskDuration"]
#columns = list(svelte_df.columns)
svelte_avg = svelte_df[columns].mean()
react_avg = react_df[columns].mean()

x = range(len(columns))
width = 0.35

plt.figure(figsize=(14, 6))
plt.bar(x, svelte_avg, width, label='Svelte')
plt.bar([i + width for i in x], react_avg, width, label='React')

plt.xticks([i + width / 2 for i in x], columns, rotation=45, ha='right')
plt.ylabel('Average Value')
plt.title('Performance Comparison: Svelte vs React')
plt.legend()
plt.tight_layout()

# Save to PDF and show
plt.savefig('comparison-all-metrics.pdf')
plt.show()