import { k } from "/kaboom.js";

const defaultTrackConfigs = {
  "stark-nuances": { volume: 0.53 },
  "battle-3": { volume: 0.66 },
  "cave-3": { volume: 0.63 },
  "neon-synth": { volume: 0.60 },
  "party-on-1": { volume: 0.47 },
  "peek-a-boo-1": { volume: 0.61 },
  "peek-a-boo-2": { volume: 0.61 },
  "sunset-alleyway": { volume: 0.77 },
};

class Music {
  currentTrack = null
  currentTrackName = null;

  play(trackName, audioConfig) {
    this.currentTrackName = trackName;
    this.currentTrack = k.play(trackName, {
      loop: true,
      ...(defaultTrackConfigs[trackName] ?? {}),
      ...(audioConfig ?? {}),
    });
  }

  stop() {
    if (this.currentTrack) this.currentTrack.stop();
  }
  
  time() {
    return this.currentTrack ? this.currentTrack.time() : 0;
  }

  name() {
    return this.currentTrackName;
  }

  fadeOut() {
    if (!this.currentTrack || this.currentTrack.stopped()) return;
    const curTrackVolume = this.currentTrack.volume();
    const fadeTime = 3;
    let spent = 0;
    const cancelFadeOut = k.action(() => {
      spent += k.dt();
      const percent = 1 - Math.min(1, (spent / fadeTime));
      this.currentTrack.volume(curTrackVolume * percent);
      if (percent <= 0) cancelFadeOut();
    });
  }

  crossFade(trackName, audioConfig) {
    audioConfig = audioConfig ?? {};
    const prevTrack = this.currentTrack;
    const curTrackVolume = audioConfig.volume ?? 1;
    const prevTrackVolume = prevTrack ? prevTrack.volume() : 0;
    if (audioConfig.volume) delete audioConfig.volume;

    this.play(trackName, {
      loop: true,
      volume: 0,
      ...audioConfig,
    });
    
    const fadeTime = 3;
    let spent = 0;
    const cancelCrossFade = k.action(() => {
      spent += k.dt();
      const percent = Math.min(1, (spent / fadeTime));
      if (percent === 0) return;
      this.currentTrack.volume(curTrackVolume * percent);
      if (prevTrack) {
        prevTrack.volume(prevTrackVolume - (prevTrackVolume * percent));
      }
      if (percent === 1) {
        cancelCrossFade();
        if (prevTrack) prevTrack.stop();
      }
    });
  }
}

export default new Music();