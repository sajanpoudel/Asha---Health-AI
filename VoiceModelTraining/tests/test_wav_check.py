import os
import sys
import wave

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from process_wav_files_to_remove_wav_errors import get_dataset_duration, is_valid_wav, zip_wav_files


def write_wav(path, rate=22050, channels=1, width=2, seconds=1):
    with wave.open(str(path), "wb") as f:
        f.setnchannels(channels)
        f.setsampwidth(width)
        f.setframerate(rate)
        f.writeframes(b"\x00" * (rate * channels * width * seconds))


def test_valid_mono_16bit_wav(tmp_path):
    write_wav(tmp_path / "ok.wav")
    assert is_valid_wav(str(tmp_path / "ok.wav"))


def test_rejects_stereo_and_odd_sample_rate(tmp_path):
    write_wav(tmp_path / "stereo.wav", channels=2)
    write_wav(tmp_path / "rate.wav", rate=44100)
    assert not is_valid_wav(str(tmp_path / "stereo.wav"))
    assert not is_valid_wav(str(tmp_path / "rate.wav"))


def test_rejects_files_that_are_not_wav(tmp_path):
    (tmp_path / "fake.wav").write_text("not audio")
    assert not is_valid_wav(str(tmp_path / "fake.wav"))


def test_dataset_duration_counts_valid_and_reports_bad_files(tmp_path):
    write_wav(tmp_path / "1.wav", seconds=2)
    write_wav(tmp_path / "2.wav", seconds=3)
    write_wav(tmp_path / "3.wav", channels=2)
    (tmp_path / "._1.wav").write_text("mac metadata")

    count, duration, invalid, hidden = get_dataset_duration(str(tmp_path))

    assert count == 2
    assert duration == "0:00:05"
    assert invalid == ["3.wav"]
    assert hidden == ["._1.wav"]


def test_zip_skips_hidden_mac_files(tmp_path):
    import zipfile

    write_wav(tmp_path / "1.wav")
    (tmp_path / "._1.wav").write_text("mac metadata")
    zip_path = tmp_path / "out.zip"

    zip_wav_files(str(tmp_path), str(zip_path))

    with zipfile.ZipFile(zip_path) as z:
        assert z.namelist() == ["1.wav"]
