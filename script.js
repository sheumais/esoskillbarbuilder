let draggedImageSrc = null;
let sourceSlot = null;
let dropSucceeded = false;

function allowDrop(event) {
  event.preventDefault();
}

function updateUsedSkillLines() {
    const slots = document.querySelectorAll('.slot');
    const usedClassSkillLines = new Set();
  
    slots.forEach(slot => {
      const info = slot.dataset.skillInfo;
      if (info) {
        const [skillClass, skillTree] = info.split(':');
        if (['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Warden', 'Necromancer'].includes(skillClass)) {
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
  skill.addEventListener('dragstart', (event) => {
    draggedImageSrc = skill.getAttribute('src');
    sourceSlot = null;
    dropSucceeded = false;
  });
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

  slot.addEventListener('dragover', (e) => {
    e.preventDefault();
    slot.classList.add('drag-over');
  });

  slot.addEventListener('dragleave', () => {
    slot.classList.remove('drag-over');
  });

  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    dropSucceeded = true;
    slot.classList.remove('drag-over');
  
    let skillElement;
  
    if (sourceSlot && sourceSlot !== slot) {
      const temp = slot.innerHTML;
      slot.innerHTML = sourceSlot.innerHTML;
      sourceSlot.innerHTML = temp;
  
      const sourceData = sourceSlot.dataset.skillInfo;
      sourceSlot.dataset.skillInfo = slot.dataset.skillInfo;
      slot.dataset.skillInfo = sourceData;
  
    } else if (draggedImageSrc) {
      skillElement = document.querySelector(`img[src="${draggedImageSrc}"]`);
      const skillInfo = skillElement?.dataset?.skillInfo || '';
      slot.innerHTML = `<img src="${draggedImageSrc}">`;
      slot.dataset.skillInfo = skillInfo;
    }
  
    draggedImageSrc = null;
    sourceSlot = null;
  
    updateUsedSkillLines();
  });
  

  slot.addEventListener('dragend', () => {
    if (!dropSucceeded && sourceSlot) {
      sourceSlot.innerHTML = '';
      delete sourceSlot.dataset.skillInfo;
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
      const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Warden', 'Necromancer'].includes(skillClass);
  
      if (isClassSkill) {
        if (!usedSkillLines.has(skillLine)) {
          container.style.display = 'none';
          const label = container.previousElementSibling;
          if (label?.classList.contains('skill-subsubgroup-label')) {
            label.style.display = 'none';
          }
        } else {
          container.style.display = '';
          const label = container.previousElementSibling;
          if (label?.classList.contains('skill-subsubgroup-label')) {
            label.style.display = '';
          }
        }
      }
    });
}

function showAllClassSkillLines() {
document.querySelectorAll('.skill-icon-row').forEach(container => {
    const skillLine = container.dataset.skillLine;
    if (!skillLine) return;

    const [skillClass] = skillLine.split(':');
    const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Warden', 'Necromancer'].includes(skillClass);

    if (isClassSkill) {
    container.style.display = '';
    const label = container.previousElementSibling;
    if (label?.classList.contains('skill-subsubgroup-label')) {
        label.style.display = '';
    }
    }
});
}
  

fetch('skills.json')
  .then(response => response.json())
  .then(skillData => {
    const skillPool = document.querySelector('.skill-pool');
    const mainCategoryOrder = ['Class', 'Non Class'];
    const classOrder = [
      'Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Warden', 'Necromancer', 'Weapon', 'Armor', 'World', 'Guild', 'Alliance War'
    ];
    const nestedGroups = {};
    Object.entries(skillData).forEach(([fileName, data]) => {
      const mainCat = data.mainCategory
      const skillClass = data.class
      const skillTree = data.skillTree

      if (!nestedGroups[mainCat]) nestedGroups[mainCat] = {};
      if (!nestedGroups[mainCat][skillClass]) nestedGroups[mainCat][skillClass] = {};
      if (!nestedGroups[mainCat][skillClass][skillTree]) nestedGroups[mainCat][skillClass][skillTree] = [];

      nestedGroups[mainCat][skillClass][skillTree].push({ fileName, ...data });
    });

    mainCategoryOrder.forEach(mainCat => {
      if (!nestedGroups[mainCat]) return;
      classOrder.forEach(skillClass => {
        const skillTrees = nestedGroups[mainCat][skillClass];
        if (!skillTrees) return;
      
        if (skillClass === 'Armor') {
          const allArmorSkills = [];
          const treeLabel = document.createElement('div');
          treeLabel.classList.add('skill-subsubgroup-label');
          treeLabel.textContent = "Armour";
          skillPool.appendChild(treeLabel);
      
          Object.values(skillTrees).forEach(skills => {
            allArmorSkills.push(...skills);
          });

          const iconContainer = document.createElement('div');
          iconContainer.classList.add('skill-icon-row');
          iconContainer.dataset.skillLine = `${skillClass}:Armor`;
          skillPool.appendChild(iconContainer);
      
          allArmorSkills.sort((a, b) => a.position - b.position);
          allArmorSkills.forEach(({ fileName, skillName }) => {
            const img = document.createElement('img');
            img.src = `icons/${fileName.replace('.dds', '.png')}`;
            img.alt = skillName;
            img.title = skillName;
            img.classList.add('skill');
            img.dataset.skillInfo = `${skillClass}:Armor`;
            img.setAttribute('draggable', 'true');
      
            img.onerror = () => {
              console.warn(`Failed to load image: ${img.src}`);
            };
      
            img.addEventListener('dragstart', () => {
              draggedImageSrc = img.getAttribute('src');
              sourceSlot = null;
              dropSucceeded = false;
            });
      
            iconContainer.appendChild(img);
          });
        } else {
          Object.entries(skillTrees).forEach(([skillTree, skills]) => {
            const treeLabel = document.createElement('div');
            treeLabel.classList.add('skill-subsubgroup-label');
            treeLabel.textContent = skillTree;
            skillPool.appendChild(treeLabel);
      
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('skill-icon-row');
            iconContainer.dataset.skillLine = `${skillClass}:${skillTree}`;
            skillPool.appendChild(iconContainer);
      
            skills.sort((a, b) => a.position - b.position);
            skills.forEach(({ fileName, skillName }) => {
              const img = document.createElement('img');
              img.src = `icons/${fileName.replace('.dds', '.png')}`;
              img.alt = skillName;
              img.title = skillName;
              img.classList.add('skill');
              img.dataset.skillInfo = `${skillClass}:${skillTree}`;
              img.setAttribute('draggable', 'true');
      
              img.onerror = () => {
                console.warn(`Failed to load image: ${img.src}`);
              };
      
              img.addEventListener('dragstart', () => {
                draggedImageSrc = img.getAttribute('src');
                sourceSlot = null;
                dropSucceeded = false;
              });
      
              iconContainer.appendChild(img);
            });
          });
        }
      });
    })});