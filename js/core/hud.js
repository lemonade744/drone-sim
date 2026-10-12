const el = id => document.getElementById(id);

export class HUD {
  constructor() {
    this.els = {
      alt: el('alt'), spd: el('spd'), vspd: el('vspd'),
      pitch: el('pitch'), roll: el('roll'), yaw: el('yaw'),
      thr: el('thr'), status: el('status'), cam: el('cam'),
      mapName: el('mapName'), modeName: el('modeName'),
      score: el('score'), scoreTotal: el('scoreTotal'),
      timer: el('timer'),
      msg: el('msg'), err: el('err'),
      menu: el('menu'), mapList: el('mapList'),
    };
    this.cameraMode = 0;
    this.camModes = ['Следящая', 'От первого лица', 'Сверху'];
    this.score = 0;
    this.scoreTotal = 0;

    window.addEventListener('error', e => this.showError(e.error || e.message));
    window.addEventListener('unhandledrejection', e => this.showError(e.reason));

    addEventListener('keydown', e => {
      if (e.code === 'Escape') this.hideMenu();
    });
  }

  setMap(name, mode, total) {
    this.els.mapName.textContent = name;
    this.els.modeName.textContent =
      mode === 'stars' ? 'Сбор звёзд' :
      mode === 'rings' ? 'Полёт через кольца' : mode;
    this.score = 0;
    this.scoreTotal = total;
    this.els.score.textContent = '0';
    this.els.scoreTotal.textContent = String(total);
    this.els.timer.textContent = '—';
    this.hideMessage();
  }

  updateTimer(t) {
    this.els.timer.textContent = (t === null || t === undefined) ? '—' : t.toFixed(1);
  }

  incrementScore() {
    this.score++;
    this.els.score.textContent = String(this.score);
  }

  cycleCamera() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    this.els.cam.textContent = this.camModes[this.cameraMode];
  }

  showMessage(text, type) {
    this.els.msg.textContent = text;
    this.els.msg.className = 'show ' + (type || '');
  }
  hideMessage() { this.els.msg.className = ''; }

  showFinal(t) {
    this.showMessage(`🏁 ФИНИШ\nВремя: ${t.toFixed(2)} с\nНажмите M для меню`, 'info');
  }

  showError(e) {
    const txt = (e && (e.stack || e.message)) || String(e);
    this.els.err.style.display = 'block';
    this.els.err.textContent = 'Ошибка:\n' + txt;
    console.error(e);
  }

  sync(flight, drone, camera) {
    const s = flight.state;
    this.els.alt.textContent = drone.group.position.y.toFixed(1);
    this.els.spd.textContent = s.vel.length().toFixed(1);
    this.els.vspd.textContent = s.vel.y.toFixed(1);
    this.els.pitch.textContent = (s.pitch * 180 / Math.PI).toFixed(1);
    this.els.roll.textContent  = (s.roll  * 180 / Math.PI).toFixed(1);
    let yaw = (s.yaw * 180 / Math.PI) % 360;
    if (yaw < 0) yaw += 360;
    this.els.yaw.textContent = yaw.toFixed(0);
    this.els.thr.textContent = String(Math.round((s.lastThrottle / (2 * 9.81)) * 100));

    const statusTxt =
      flight.status === 'flying'  ? 'Полёт' :
      flight.status === 'landed'  ? 'На поверхности' :
      flight.status === 'crashed' ? 'КРУШЕНИЕ' : '—';
    this.els.status.textContent = statusTxt;
    this.els.status.style.color =
      flight.status === 'crashed' ? '#f33' :
      flight.status === 'landed'  ? '#37ff7a' : '#0f0';
  }

  // === Меню карт ===
  showMenu(maps) {
    this.els.mapList.innerHTML = '';
    maps.forEach(m => {
      const card = document.createElement('div');
      card.className = 'map-card';
      card.innerHTML = `
        <h2>${m.name}</h2>
        <div class="desc">${m.description || ''}</div>
        <div class="mode">Режим: ${m.mode === 'stars' ? '⭐ звёзды' : '◎ кольца'}</div>
        <div class="count">Целей: ${m.mode === 'stars' ? m.stars?.length ?? 0 : m.rings?.length ?? 0}</div>
      `;
      card.onclick = () => this._selectMap(m.key);
      this.els.mapList.appendChild(card);
    });
    this.els.menu.classList.remove('hidden');
  }
  hideMenu() { this.els.menu.classList.add('hidden'); }
  toggleMenu() { this.els.menu.classList.toggle('hidden'); }

  onMapSelected(handler) { this._selectMap = handler; }
}