Repozytorium ze skryptami i wynikami testów.

Dla każdego testu zbierane są wyniki w plikach .txt, gdzie pojedynczy wiersz odpowiada za jeden przebieg testu. Następnie w programach napisanych w języku Python wyliczana jest średnia wartość każdej metryki.
Wynik zapisywany jest w odpowiednim pliku .csv. Tabele w pracy zawierają właśnie dane z tych plików.

Przykładowo plik solid-signal-extra-performance-metrics-50000-artists-2025-06-16T07-23-30.135Z.txt zawiera wyniki renderowania 50000 artystów w Solid przy 100 powtórzeniach, wykorzystując createSignal().
Następnie w solid_render_artists_signal_performance_csv.py wyliczany jest średni wynik i zapisywany do solid_render_artists_signal_metrics_performance_summary.csv. 
