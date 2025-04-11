let draggedImageSrc = null;
let sourceSlot = null;
let dropSucceeded = false;

function allowDrop(event) {
  event.preventDefault();
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

    if (sourceSlot && sourceSlot !== slot) {
      const temp = slot.innerHTML;
      slot.innerHTML = sourceSlot.innerHTML;
      sourceSlot.innerHTML = temp;
    } else if (draggedImageSrc) {
      slot.innerHTML = `<img src="${draggedImageSrc}" alt="Skill Icon">`;
    }

    draggedImageSrc = null;
    sourceSlot = null;
  });

  slot.addEventListener('dragend', () => {
    if (!dropSucceeded && sourceSlot) {
      sourceSlot.innerHTML = '';
    }

    draggedImageSrc = null;
    sourceSlot = null;
    dropSucceeded = false;
  });
});

fetch('skills.json')
  .then(response => response.json())
  .then(skillFiles => {
    const skillPool = document.querySelector('.skill-pool');

    const groups = {};

    // Group the skills by subtype or into 'misc'
    skillFiles.forEach(file => {
        const fileName = file.split('/').pop();
        const match = fileName.match(/^ability_([^_]+)/); 
        if (match) {
          const subtype = match[1];
          if (!groups[subtype]) groups[subtype] = [];
          groups[subtype].push(file);
        } else {
          if (!groups['misc']) groups['misc'] = [];
          groups['misc'].push(file);
        }
    });

    const orderedGroups = [
      'arcanist',
      'templar',
      'dragonknight',
      'nightblade',
      'sorcerer',
      'warden',
      'necromancer',
      '2handed',
      '1handed',
      'dualwield',
      'bow',
      'destructionstaff',
      'restorationstaff',
      'armor',
      'otherclass',
      'fightersguild',
      'mageguild',
      'psijic',
      'grimoire',
      'undaunted',
      'vampire',
      'werewolf',
      'ava',
    ];

    orderedGroups.forEach(subtype => {
        if (groups[subtype]) {
          const label = document.createElement('div');
          label.classList.add('skill-group-label');
          label.textContent = subtype.toUpperCase();
          skillPool.appendChild(label);

          groups[subtype].forEach(file => {
            const img = document.createElement('img');
            img.src = `icons/${file}`;
            img.alt = file.replace('.png', '');
            img.classList.add('skill');
            img.setAttribute('draggable', 'true');

            img.addEventListener('dragstart', (event) => {
              draggedImageSrc = img.getAttribute('src');
              sourceSlot = null;
              dropSucceeded = false;
            });

            skillPool.appendChild(img);
          });
        }
    });

    Object.entries(groups).forEach(([subtype, files]) => {
        if (!orderedGroups.includes(subtype)) {
          const label = document.createElement('div');
          label.classList.add('skill-group-label');
          label.textContent = subtype.toUpperCase();
          skillPool.appendChild(label);

          files.forEach(file => {
            const img = document.createElement('img');
            img.src = `icons/${file}`;
            img.alt = file.replace('.png', '');
            img.classList.add('skill');
            img.setAttribute('draggable', 'true');

            img.addEventListener('dragstart', (event) => {
              draggedImageSrc = img.getAttribute('src');
              sourceSlot = null;
              dropSucceeded = false;
            });

            skillPool.appendChild(img);
          });
        }
    });
  });

