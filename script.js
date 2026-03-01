let draggedImageSrc = null;
let sourceSlot = null;
let dropSucceeded = false;
let skillID = 0;
const skillTable = {};

const touchDrag = {
  clone: null,
  startX: 0,
  startY: 0,
  originImg: null,
  originSlot: null
};

function enableTouchOnImg(img, originSlot = null) {
  img.addEventListener('touchstart', (ev) => {
    if (ev.touches.length > 1) return;
    const t = ev.touches[0];
    ev.preventDefault();

    draggedImageSrc = img.getAttribute('src');
    sourceSlot = originSlot;
    dropSucceeded = false;

    touchDrag.originImg = img;
    touchDrag.originSlot = originSlot;

    const clone = img.cloneNode(true);
    const rect = img.getBoundingClientRect();
    clone.style.position = 'fixed';
    clone.style.left = (t.clientX - (rect.width / 2 || 24)) + 'px';
    clone.style.top = (t.clientY - (rect.height / 2 || 24)) + 'px';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = 9999;
    clone.classList.add('touch-drag-clone');
    document.body.appendChild(clone);
    touchDrag.clone = clone;

    touchDrag.startX = t.clientX;
    touchDrag.startY = t.clientY;
  }, { passive: false });
}

document.addEventListener('touchmove', (ev) => {
  if (!touchDrag.clone) return;
  const t = ev.touches[0];
  ev.preventDefault();
  const rect = touchDrag.clone.getBoundingClientRect();
  touchDrag.clone.style.left = (t.clientX - (rect.width / 2 || 24)) + 'px';
  touchDrag.clone.style.top = (t.clientY - (rect.height / 2 || 24)) + 'px';
}, { passive: false });

document.addEventListener('touchend', (ev) => {
  if (!touchDrag.clone) return;
  const t = ev.changedTouches[0];

  const el = document.elementFromPoint(t.clientX, t.clientY);
  const targetSlot = el ? el.closest('.slot') : null;

  if (targetSlot) {
    if (touchDrag.originSlot && touchDrag.originSlot !== targetSlot) {
      const tempHTML = targetSlot.innerHTML;
      const tempSkillInfo = targetSlot.dataset.skillInfo;
      const tempSkillID = targetSlot.dataset.skillID;

      targetSlot.innerHTML = touchDrag.originSlot.innerHTML;
      if (touchDrag.originSlot.dataset.skillInfo) targetSlot.dataset.skillInfo = touchDrag.originSlot.dataset.skillInfo;
      if (touchDrag.originSlot.dataset.skillID) targetSlot.dataset.skillID = touchDrag.originSlot.dataset.skillID;
      else delete targetSlot.dataset.skillInfo;

      touchDrag.originSlot.innerHTML = tempHTML;
      if (tempSkillID) {
        touchDrag.originSlot.dataset.skillInfo = tempSkillInfo;
        touchDrag.originSlot.dataset.skillID = tempSkillID;
      } else {
        delete touchDrag.originSlot.dataset.skillInfo;
        delete touchDrag.originSlot.dataset.skillID;
      }
    } else {
      const origin = touchDrag.originImg;
      if (origin?.dataset?.skillID) {
        const newImg = document.createElement('img');
        newImg.src = origin.getAttribute('src');
        newImg.alt = origin.alt || '';
        newImg.title = origin.title || '';
        newImg.setAttribute('draggable', 'true');

        newImg.dataset.skillInfo = origin.dataset.skillInfo;
        newImg.dataset.skillID = origin.dataset.skillID;

        newImg.addEventListener('dragstart', () => {
          draggedImageSrc = newImg.getAttribute('src');
          sourceSlot = null;
          dropSucceeded = false;
        });
        enableTouchOnImg(newImg, targetSlot);

        targetSlot.innerHTML = '';
        targetSlot.appendChild(newImg);
        targetSlot.dataset.skillInfo = newImg.dataset.skillInfo;
        targetSlot.dataset.skillID = newImg.dataset.skillID;
      } else {
        targetSlot.innerHTML = '';
        delete targetSlot.dataset.skillInfo;
        delete targetSlot.dataset.skillID;
      }
    }
    dropSucceeded = true;
  } else {
    if (touchDrag.originSlot) {
      touchDrag.originSlot.innerHTML = '';
      delete touchDrag.originSlot.dataset.skillInfo;
      delete touchDrag.originSlot.dataset.skillID;
    }
  }

  touchDrag.clone.remove();
  touchDrag.clone = null;
  touchDrag.originImg = null;
  touchDrag.originSlot = null;
  draggedImageSrc = null;
  sourceSlot = null;

  updateUsedSkillLines();
}, { passive: false });

document.addEventListener('touchcancel', () => {
  if (touchDrag.clone) touchDrag.clone.remove();
  touchDrag.clone = null;
  touchDrag.originImg = null;
  touchDrag.originSlot = null;
  draggedImageSrc = null;
  sourceSlot = null;
  dropSucceeded = false;
  updateUsedSkillLines();
});

(function injectTouchCSS(){
  try {
    const style = document.createElement('style');
    style.textContent = `
.skill, .slot { touch-action: none; }
.touch-drag-clone { transition: transform 0.06s linear; will-change: transform; }
`;
    document.head.appendChild(style);
  } catch(e) {
  }
})();

function generateShareableURL() {
    const slotSetup = [];
    document.querySelectorAll('.slot').forEach(slot => {
        if (slot && slot.dataset.skillID) {
            slotSetup.push(slot.dataset.skillID);
        } else {
            slotSetup.push('');
        }
    });
    const url = new URL(window.location.href);
    url.searchParams.set("skills", "LIST_OF_IDS_PLACEHOLDER");
    const newUrlString = url.toString().replace("LIST_OF_IDS_PLACEHOLDER", slotSetup.join(','));
    history.pushState({}, '', newUrlString);
}

function loadSetupFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const idsParam = urlParams.get('skills');
    if (!idsParam) return;

    const skillIDs = idsParam.split(',');
    document.querySelectorAll('.slot').forEach((slot, index) => {
        const skillID = skillIDs[index];
        if (skillID && skillTable[skillID]) {
            const skill = skillTable[skillID];
            const img = document.createElement('img');
            img.src = `icons/${skill.fileName}`;
            img.alt = skill.skillName;
            img.title = skill.skillName;
            img.setAttribute('draggable', 'true');
            img.dataset.skillInfo = `${skill.skillClass}:${skill.skillTree}`;
            img.dataset.skillID = skillID;
            img.addEventListener('dragstart', () => {
                draggedImageSrc = img.getAttribute('src');
                sourceSlot = null;
                dropSucceeded = false;
            });
            enableTouchOnImg(img, slot);

            slot.innerHTML = '';
            slot.appendChild(img);
            slot.dataset.skillInfo = `${skill.skillClass}:${skill.skillTree}`;
            slot.dataset.skillID = skillID;
        } else {
            slot.innerHTML = '';
            delete slot.dataset.skillInfo;
            delete slot.dataset.skillID;
        }
    });
    updateUsedSkillLines();
}

function updateResetButtonVisibility() {
    const hasSkills = Array.from(document.querySelectorAll('.slot')).some(slot => slot.dataset.skillID);
    const resetButton = document.getElementById('reset');
    resetButton.classList.toggle('visible', hasSkills);
}

function resetSkillSlots() {
    document.querySelectorAll('.slot').forEach(slot => {
        slot.innerHTML = '';
        delete slot.dataset.skillInfo;
        delete slot.dataset.skillID;
    });
    updateUsedSkillLines();
    updateResetButtonVisibility();
    const resetButton = document.getElementById('reset');
    resetButton.style.setProperty('--base-rotation', '360deg');
    resetButton.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        if (!resetButton.classList.contains('visible')) {
            resetButton.removeAttribute('style');
        }
    }, 400);
}

function allowDrop(event) { event.preventDefault(); }

function updateUsedSkillLines() {
    generateShareableURL();
    updateResetButtonVisibility();
    const usedClassSkillLines = new Set();
    document.querySelectorAll('.slot').forEach(slot => {
        const info = slot.dataset.skillInfo;
        if (info) {
            const [skillClass, skillTree] = info.split(':');
            if (["Arcanist","Nightblade","Templar","Dragonknight","Sorcerer","Warden","Necromancer"].includes(skillClass)) {
                usedClassSkillLines.add(`${skillClass}:${skillTree}`);
            }
        }
    });
    if (usedClassSkillLines.size >= 3) {
        hideUnusedClassSkillLines(usedClassSkillLines);
    } else {
        showAllClassSkillLines();
    }
}

document.querySelectorAll('.skill').forEach(skill => {
    skill.addEventListener('dragstart', () => {
        draggedImageSrc = skill.getAttribute('src');
        sourceSlot = null;
        dropSucceeded = false;
    });
    enableTouchOnImg(skill, null);
});

document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragstart', () => {
        const img = slot.querySelector('img');
        if (img) {
            draggedImageSrc = img.getAttribute('src');
            sourceSlot = slot;
            dropSucceeded = false;
        }
    });
    slot.addEventListener('dragover', allowDrop);
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        dropSucceeded = true;
        slot.classList.remove('drag-over');

        if (sourceSlot && sourceSlot !== slot) {
            const tempHTML = slot.innerHTML;
            const tempSkillInfo = slot.dataset.skillInfo;
            const tempSkillID = slot.dataset.skillID;
            slot.innerHTML = sourceSlot.innerHTML;
            slot.dataset.skillInfo = sourceSlot.dataset.skillInfo;
            slot.dataset.skillID = sourceSlot.dataset.skillID;
            sourceSlot.innerHTML = tempHTML;
            if (tempSkillID) {
                sourceSlot.dataset.skillInfo = tempSkillInfo;
                sourceSlot.dataset.skillID = tempSkillID;
            } else {
                delete sourceSlot.dataset.skillInfo;
                delete sourceSlot.dataset.skillID;
            }
        } else if (draggedImageSrc) {
            const skillElement = document.querySelector(`img[src="${draggedImageSrc}"]`);
            const newImg = document.createElement('img');
            newImg.src = draggedImageSrc;
            newImg.alt = skillElement?.alt || '';
            newImg.title = skillElement?.title || '';
            newImg.setAttribute('draggable', 'true');

            if (skillElement?.dataset.skillID) {
                newImg.dataset.skillInfo = skillElement.dataset.skillInfo;
                newImg.dataset.skillID = skillElement.dataset.skillID;
                newImg.addEventListener('dragstart', () => {
                    draggedImageSrc = newImg.getAttribute('src');
                    sourceSlot = null;
                    dropSucceeded = false;
                });
                enableTouchOnImg(newImg, slot);
                slot.innerHTML = '';
                slot.appendChild(newImg);
                slot.dataset.skillInfo = newImg.dataset.skillInfo;
                slot.dataset.skillID = newImg.dataset.skillID;
            } else {
                slot.innerHTML = '';
                delete slot.dataset.skillInfo;
                delete slot.dataset.skillID;
            }
        }

        draggedImageSrc = null;
        sourceSlot = null;
        updateUsedSkillLines();
    });
    slot.addEventListener('dragend', () => {
        if (!dropSucceeded && sourceSlot) {
            sourceSlot.innerHTML = '';
            delete sourceSlot.dataset.skillInfo;
            delete sourceSlot.dataset.skillID;
        }
        draggedImageSrc = null;
        sourceSlot = null;
        dropSucceeded = false;
        updateUsedSkillLines();
    });
});

function hideUnusedClassSkillLines(usedSkillLines) {
    document.querySelectorAll('.skill-icon-row').forEach(container => {
        const skillLine = container.dataset.skillLine;
        if (!skillLine) return;
        const [skillClass] = skillLine.split(':');
        const isClassSkill = ["Arcanist","Nightblade","Templar","Dragonknight","Sorcerer","Warden","Necromancer"].includes(skillClass);
        if (isClassSkill) {
            const visible = usedSkillLines.has(skillLine);
            container.style.display = visible ? '' : 'none';
            const label = container.previousElementSibling;
            if (label?.classList.contains('skill-subsubgroup-label')) label.style.display = visible ? '' : 'none';
        }
    });
}

function showAllClassSkillLines() {
    document.querySelectorAll('.skill-icon-row').forEach(container => {
        const skillLine = container.dataset.skillLine;
        if (!skillLine) return;
        const [skillClass] = skillLine.split(':');
        const isClassSkill = ["Arcanist","Nightblade","Templar","Dragonknight","Sorcerer","Warden","Necromancer"].includes(skillClass);
        if (isClassSkill) {
            container.style.display = '';
            const label = container.previousElementSibling;
            if (label?.classList.contains('skill-subsubgroup-label')) label.style.display = '';
        }
    });
}

function setRandomFavicon() {
    const skillIds = Object.keys(skillTable);
    const randomSkillID = skillIds[Math.floor(Math.random() * skillIds.length)];
    const randomSkill = skillTable[randomSkillID];
    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }
    favicon.href = `icons/${randomSkill.fileName}`;
}

fetch('skills.json')
    .then(response => response.json())
    .then(skillData => {
        const skillPool = document.querySelector('.skill-pool');
        const classOrder = ["Arcanist", "Nightblade", "Templar", "Dragonknight", "Sorcerer", "Warden", "Necromancer", "Weapon", "Armor", "World", "Guild", "Alliance War", "Misc"];

        Object.entries(skillData).forEach(([id, data]) => {
            skillTable[id] = data;
        });

        classOrder.forEach(skillClass => {
            const classSkills = Object.entries(skillTable).filter(([, data]) => data.skillClass === skillClass);
            if (classSkills.length === 0) return;

            const groupedByTree = {};
            classSkills.forEach(([id, data]) => {
                const tree = data.skillTree;
                if (!groupedByTree[tree]) groupedByTree[tree] = [];
                groupedByTree[tree].push({ id, ...data });
            });

            Object.entries(groupedByTree).forEach(([skillTree, skills]) => {
                const treeLabel = document.createElement('div');
                treeLabel.classList.add('skill-subsubgroup-label');

                const labelWrapper = document.createElement('div');
                labelWrapper.classList.add('skill-line-label-wrapper');
                labelWrapper.appendChild(document.createTextNode(skillTree));

                if (["Arcanist","Nightblade","Templar","Dragonknight","Sorcerer","Warden","Necromancer"].includes(skillClass)) {
                    const icon = document.createElement('img');
                    icon.src = `icons/gp_class_${skillClass.toLowerCase()}.png`;
                    icon.classList.add('skill-line-icon');
                    labelWrapper.appendChild(icon);

                    const link = document.createElement('a');
                    link.href = `https://eso-hub.com/en/skills/${skillClass.toLowerCase()}/${skillTree.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`;
                    link.target = '_blank';
                    link.classList.add('skill-line-link');
                    link.appendChild(labelWrapper);
                    treeLabel.appendChild(link);
                } else {
                    treeLabel.appendChild(labelWrapper);
                }

                skillPool.appendChild(treeLabel);

                const iconContainer = document.createElement('div');
                iconContainer.classList.add('skill-icon-row');
                iconContainer.dataset.skillLine = `${skillClass}:${skillTree}`;
                skillPool.appendChild(iconContainer);

                skills.sort((a, b) => a.position - b.position);
                skills.forEach(({ id, fileName, skillName }) => {
                    const img = document.createElement('img');
                    img.src = `icons/${fileName}`;
                    img.alt = skillName;
                    img.title = skillName;
                    img.classList.add('skill');
                    img.dataset.skillInfo = `${skillClass}:${skillTree}`;
                    img.dataset.skillID = id;
                    img.setAttribute('draggable', 'true');
                    img.addEventListener('dragstart', () => {
                        draggedImageSrc = img.getAttribute('src');
                        sourceSlot = null;
                        dropSucceeded = false;
                    });
                    enableTouchOnImg(img, null);
                    iconContainer.appendChild(img);
                });
            });
        });

        loadSetupFromURL();
        setRandomFavicon();
    });
