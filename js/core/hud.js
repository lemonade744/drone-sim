const el = id => document.getElementById(id);

export class HUD {
  constructor() {
    this.els = {
      alt: el('alt'), spd: el('spd'), vspd: el('vspd'),
      pitch: el('pitch'), roll: el('roll'), yaw: el('yaw'),
      thr: el('thr'), status: el('status'), cam: el('cam'),
      mapName: el('mapName'), modeName: el('modeName'),
      modelName: el('modelName'),
      score: el('score'), scoreTotal: el('scoreTotal'),
      timer: el('timer'),
      msg: el('msg'), err: el('err'),
      menu: el('menu'), mapList: el('mapList'),
    };
    this.cameraMode = 0;
    this.camModes = ['Следящая', 'От первого лица', 'Сверху'];
    this.score = 0;
    this.scoreTotal = 0;
    this.currentModel = 'quadcopter';

    window.addEventListener('error', e => this.showError(e.error || e.message));
    window.addEventListener('unhandledrejection', e => this.showError(e.reason));

    addEventListener('keydown', e => {
      if (e.code === 'Escape') this.hideMenu();
    });
  }

  setMap(name, mode, total, modelName) {
    this.els.mapName.textContent = name;
    this.els.modeName.textContent =
      mode === 'stars' ? 'Сбор звёзд' :
      mode === 'rings' ? 'Полёт через кольца' : mode;
    if (this.els.modelName) this.els.modelName.textContent = modelName || '—';
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
    this.showMessage(`ФИНИШ\nВремя: ${t.toFixed(2)} с\nНажмите M для меню`, 'info');
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

  // === Меню ===
  showMenu(maps, models) {
    this.els.mapList.innerHTML = '';

    // Секция моделей
    if (models && models.length) {
      const modelsSection = document.createElement('div');
      modelsSection.className = 'menu-section';
      modelsSection.innerHTML = '<h3>Модель дрона</h3>';
      const modelRow = document.createElement('div');
      modelRow.className = 'model-row';
      models.forEach(m => {
        const btn = document.createElement('div');
        btn.className = 'model-card' + (m.key === this.currentModel ? ' active' : '');
        btn.innerHTML = `<h4>${m.name}</h4><div class="desc">${m.description}</div>`;
        btn.onclick = () => {
          this.currentModel = m.key;
          [...modelRow.children].forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          if (this._selectModel) this._selectModel(m.key);
        };
        modelRow.appendChild(btn);
      });
      modelsSection.appendChild(modelRow);
      this.els.mapList.appendChild(modelsSection);
    }

    // Секция карт
    const mapsSection = document.createElement('div');
    mapsSection.className = 'menu-section';
    mapsSection.innerHTML = '<h3>Карта</h3>';
    const mapsRow = document.createElement('div');
    mapsRow.className = 'map-row';
    maps.forEach(m => {
      const card = document.createElement('div');
      card.className = 'map-card';
      card.innerHTML = `
        <h2>${m.name}</h2>
        <div class="desc">${m.description || ''}</div>
        <div class="mode">Режим: ${m.mode === 'stars' ? 'звёзды' : 'кольца'}</div>
        <div class="count">Целей: ${m.mode === 'stars' ? m.stars?.length ?? 0 : m.rings?.length ?? 0}</div>
      `;
      card.onclick = () => this._selectMap(m.key, this.currentModel);
      mapsRow.appendChild(card);
    });
    mapsSection.appendChild(mapsRow);
    this.els.mapList.appendChild(mapsSection);

    this.els.menu.classList.remove('hidden');
  }
  hideMenu() { this.els.menu.classList.add('hidden'); }
  toggleMenu() { this.els.menu.classList.toggle('hidden'); }

  onMapSelected(handler) { this._selectMap = handler; }
  onModelSelected(handler) { this._selectModel = handler; }
}