/* Shared by the browser and update-preview.mjs. No build dependencies. */
(() => {
  'use strict';
  const required = (value, label) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}: 내용을 입력해 주세요.`);
  };
  function assemble(common, parts) {
    if (common.schemaVersion !== 1) throw new Error('common.json의 schemaVersion은 1이어야 합니다.');
    for (const key of ['title', 'shortTitle', 'tagline', 'footer', 'storageKey']) required(common.app?.[key], `common.json app.${key}`);
    const learning = common.learning;
    if (!learning || !Number.isFinite(learning.defaultSpeechRate) || learning.defaultSpeechRate < 0.5 || learning.defaultSpeechRate > 2) throw new Error('기본 발음 속도는 0.5~2로 입력해 주세요.');
    if (!Number.isInteger(learning.quizOptionCount) || learning.quizOptionCount < 2 || learning.quizOptionCount > 4) throw new Error('객관식 보기 수는 2~4로 입력해 주세요.');
    new Intl.DateTimeFormat('ko-KR', {timeZone: learning.timezone});
    const screens = ['study', 'quiz', 'history', 'settings'];
    if (!Array.isArray(common.navigation) || common.navigation.length !== screens.length || new Set(common.navigation.map(n => n.id)).size !== screens.length) throw new Error('하단 메뉴는 study, quiz, history, settings를 각각 한 번씩 지정해 주세요.');
    common.navigation.forEach(n => {if (!screens.includes(n.id)) throw new Error(`알 수 없는 메뉴: ${n.id}`); required(n.label, '메뉴 이름');});
    if (!Array.isArray(common.departments) || !common.departments.length) throw new Error('학과 목록이 비어 있습니다.');
    const departmentIds = new Set(), filenames = new Set(), ids = new Set(), expressions = [];
    common.departments.forEach((d, i) => {
      required(d.id, '학과 ID'); required(d.name, `${d.id} 학과 이름`);
      if (departmentIds.has(d.id)) throw new Error(`중복 학과 ID: ${d.id}`);
      departmentIds.add(d.id);
      if (!/^[a-z][a-z0-9-]*\.json$/.test(d.file || '') || filenames.has(d.file)) throw new Error(`${d.id}: 학과 파일 이름이 올바르지 않거나 중복됩니다.`);
      filenames.add(d.file);
      for (const key of ['en', 'description', 'icon']) required(d[key], `${d.id} ${key}`);
      if (!/^#[\da-fA-F]{6}$/.test(d.color)) throw new Error(`${d.id}: 색상은 #4286cf 형식으로 입력해 주세요.`);
      const part = parts[i];
      if (part?.schemaVersion !== 1 || part.departmentId !== d.id || !Array.isArray(part.expressions)) throw new Error(`${d.file}: 학과 ID 또는 expressions 배열을 확인해 주세요.`);
      const days = new Set();
      if (d.active !== false && part.expressions.length < learning.quizOptionCount) throw new Error(`${d.file}: 퀴즈 보기 수만큼 표현이 필요합니다.`);
      part.expressions.forEach(e => {
        required(e.id, `${d.file} 표현 ID`);
        if (ids.has(e.id)) throw new Error(`중복 표현 ID: ${e.id}`);
        ids.add(e.id);
        if (e.departmentId !== d.id) throw new Error(`${e.id}: departmentId는 ${d.id}이어야 합니다.`);
        if (!Number.isInteger(e.day) || e.day < 1 || days.has(e.day)) throw new Error(`${d.file}: 학습 순서(day)가 중복되거나 올바르지 않습니다.`);
        days.add(e.day);
        for (const key of ['text', 'meaning', 'tip', 'reply', 'replyKo']) required(e[key], `${e.id} ${key}`);
        if (!Array.isArray(e.similar) || e.similar.length < 2 || e.similar.length > 3) throw new Error(`${e.id}: 유사 표현을 2~3개 입력해 주세요.`);
        e.similar.forEach(s => required(s, `${e.id} 유사 표현`));
      });
      if (d.active !== false) {
        if (new Set(part.expressions.map(e => e.meaning)).size < learning.quizOptionCount) throw new Error(`${d.file}: 서로 다른 뜻이 최소 ${learning.quizOptionCount}개 필요합니다.`);
      }
      // Keep hidden-department records available for history and today's lock.
      expressions.push(...part.expressions.slice().sort((a,b) => a.day-b.day));
    });
    const departments = common.departments.filter(d => d.active !== false);
    if (!departments.length) throw new Error('표시할 학과를 하나 이상 활성화해 주세요.');
    return {schemaVersion: 1, app: common.app, learning, navigation: common.navigation, departments, allDepartments: common.departments, expressions};
  }
  async function load(baseURL) {
    async function json(url) {
      const name = new URL(url).pathname.split('/').pop();
      let response;
      try {response = await fetch(url, {cache:'no-store'});} catch {throw new Error(`${name}: 파일을 불러올 수 없습니다.`);}
      if (!response.ok) throw new Error(`${name}: 파일을 찾을 수 없습니다 (${response.status}).`);
      try {return await response.json();} catch {throw new Error(`${name}: JSON 문법을 확인해 주세요.`);}
    }
    const commonURL = new URL('./data/common.json', baseURL);
    const common = await json(commonURL);
    if (!Array.isArray(common.departments)) throw new Error('common.json의 departments를 확인해 주세요.');
    // Validate file paths before fetching; detailed schema validation follows.
    const parts = await Promise.all(common.departments.map(d => {
      if (!/^[a-z][a-z0-9-]*\.json$/.test(d.file || '')) throw new Error('학과 파일 이름을 확인해 주세요.');
      return json(new URL(d.file, commonURL));
    }));
    return assemble(common, parts);
  }
  globalThis.SmalltalkData = Object.freeze({assemble, load});
})();
