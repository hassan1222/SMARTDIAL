import torchaudio
import torchaudio
torchaudio.set_audio_backend("soundfile")

from speechbrain.pretrained import SepformerSeparation as separator

model = separator.from_hparams(source="C:\Users\user\Downloads\speechbrain", savedir='D:\SmartDial')

audio_url = sys.argv[1]
est_sources = model.separate_file(path=audio_url)

torchaudio.save("source1hat.wav", est_sources[:, :, 0].detach().cpu(), 8000)
torchaudio.save("source2hat.wav", est_sources[:, :, 1].detach().cpu(), 8000)
