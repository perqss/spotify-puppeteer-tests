import json
import os
import pandas as pd

# Folder z plikami
metrics_folder = "./metrics"  # <- zmień na ścieżkę do swoich plików

# Wyodrębnienie frameworka i ilości komponentów z nazwy pliku
def parse_filename(filename):
    parts = filename.replace(".txt", "").split("-")
    framework = parts[0]
    count = int(parts[1])
    return framework, count

# Wczytanie metryk z pliku Puppeteer
def load_metrics(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f if line.strip()]

# Wyniki
results = []

# Przejdź przez pliki
for file in os.listdir(metrics_folder):
    if file.endswith(".txt"):
        framework, count = parse_filename(file)
        metrics = load_metrics(os.path.join(metrics_folder, file))
        df = pd.DataFrame(metrics).iloc[:, 1:]

        results.append({
            "Framework": framework,
            "Components": count,
            "TaskDuration": df["TaskDuration"].mean(),
            "ScriptDuration": df["ScriptDuration"].mean(),
            "JSHeapUsedSize_MB": df["JSHeapUsedSize"].mean() / (1024 * 1024),
            "JSHeapTotalSize_MB": df["JSHeapTotalSize"].mean() / (1024 * 1024)
        })

# Tworzenie tabeli
df_results = pd.DataFrame(results)

# Posortuj wyniki
df_results = df_results.sort_values(by=["Framework", "Components"])

# Zaokrąglij dla czytelności
df_results = df_results.round(3)

# Wyświetl
print(df_results)

# Zapisz do pliku CSV (opcjonalnie)
df_results.to_csv("framework_metrics_summary.csv", index=False)
