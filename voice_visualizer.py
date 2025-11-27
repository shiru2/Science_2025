#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Voice Visualizer
Real-time visualization of audio from microphone
"""

import matplotlib
matplotlib.use('macosx')  # Set backend for macOS

import numpy as np
import sounddevice as sd
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Configuration parameters
SAMPLE_RATE = 44100  # Sampling rate (Hz)
CHUNK_SIZE = 2048    # Number of samples to process at once
UPDATE_INTERVAL = 50  # Update interval (ms)

class VoiceVisualizer:
    def __init__(self):
        self.sample_rate = SAMPLE_RATE
        self.chunk_size = CHUNK_SIZE
        self.audio_data = np.zeros(self.chunk_size)

        # Initialize graphs
        self.fig, (self.ax_waveform, self.ax_spectrum) = plt.subplots(2, 1, figsize=(12, 8))
        self.fig.canvas.manager.set_window_title('Voice Visualizer')

        # Waveform graph settings
        self.ax_waveform.set_title('Waveform', fontsize=14, fontweight='bold')
        self.ax_waveform.set_xlabel('Sample', fontsize=10)
        self.ax_waveform.set_ylabel('Amplitude', fontsize=10)
        self.ax_waveform.set_ylim(-1, 1)
        self.ax_waveform.set_xlim(0, self.chunk_size)
        self.ax_waveform.grid(True, alpha=0.3)
        self.line_waveform, = self.ax_waveform.plot(np.zeros(self.chunk_size), color='#2196F3', linewidth=1.5)

        # Spectrum graph settings
        self.ax_spectrum.set_title('Frequency Spectrum', fontsize=14, fontweight='bold')
        self.ax_spectrum.set_xlabel('Frequency (Hz)', fontsize=10)
        self.ax_spectrum.set_ylabel('Amplitude', fontsize=10)
        self.ax_spectrum.set_xlim(0, self.sample_rate // 2)
        self.ax_spectrum.set_ylim(0, 1)
        self.ax_spectrum.grid(True, alpha=0.3)

        # Calculate frequency axis
        self.freq_axis = np.fft.rfftfreq(self.chunk_size, 1 / self.sample_rate)
        self.line_spectrum, = self.ax_spectrum.plot(self.freq_axis, np.zeros(len(self.freq_axis)),
                                                     color='#4CAF50', linewidth=1.5)

        # Adjust layout
        plt.tight_layout()

        # Audio stream settings
        self.stream = None

    def audio_callback(self, indata, frames, time, status):
        """
        Callback function from audio stream
        Save audio data obtained from microphone
        """
        if status:
            print(f"Status: {status}")

        # Convert to mono data (if multiple channels)
        if len(indata.shape) > 1:
            self.audio_data = indata[:, 0].copy()
        else:
            self.audio_data = indata.copy()

    def update_plot(self, frame):
        """
        Graph update function
        """
        # Update waveform
        self.line_waveform.set_ydata(self.audio_data)

        # Calculate frequency spectrum using FFT
        # Apply Hamming window to reduce spectral leakage
        windowed_data = self.audio_data * np.hamming(len(self.audio_data))
        fft_data = np.fft.rfft(windowed_data)
        fft_magnitude = np.abs(fft_data) / len(fft_data)

        # Normalize spectrum
        fft_magnitude = np.clip(fft_magnitude * 10, 0, 1)

        # Update spectrum
        self.line_spectrum.set_ydata(fft_magnitude)

        return self.line_waveform, self.line_spectrum

    def start(self):
        """
        Start the visualizer
        """
        print("Starting Voice Visualizer...")
        print(f"Sample Rate: {self.sample_rate} Hz")
        print(f"Chunk Size: {self.chunk_size}")
        print("\nPlease make some sound (speak into the microphone, etc.)")
        print("Close the window to exit\n")

        try:
            # Start audio stream
            self.stream = sd.InputStream(
                channels=1,
                samplerate=self.sample_rate,
                blocksize=self.chunk_size,
                callback=self.audio_callback
            )

            with self.stream:
                # Start animation
                ani = FuncAnimation(
                    self.fig,
                    self.update_plot,
                    interval=UPDATE_INTERVAL,
                    blit=True,
                    cache_frame_data=False
                )

                plt.show()

        except KeyboardInterrupt:
            print("\n\nExiting program")
        except Exception as e:
            print(f"\nAn error occurred: {e}")
            print("\nPlease check if your microphone is connected")
        finally:
            if self.stream:
                self.stream.close()
            print("Voice Visualizer terminated")

def main():
    """
    Main function
    """
    try:
        # Display available audio devices
        print("=== Available Audio Devices ===")
        print(sd.query_devices())
        print("=" * 40)
        print()

        # Create and start visualizer
        visualizer = VoiceVisualizer()
        visualizer.start()

    except ImportError as e:
        print(f"\nImport Error: {e}")
        print("\nPlease make sure all dependencies are installed:")
        print("  uv sync")
    except RuntimeError as e:
        if "backend" in str(e).lower():
            print(f"\nBackend Error: {e}")
            print("\nTrying alternative backend...")
            matplotlib.use('Qt5Agg')
            visualizer = VoiceVisualizer()
            visualizer.start()
        else:
            raise
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        print("\nPlease check:")
        print("  1. Your microphone is connected and working")
        print("  2. Microphone permissions are granted (System Settings > Privacy)")
        print("  3. All dependencies are installed (uv sync)")

if __name__ == "__main__":
    main()
