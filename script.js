let draggedImageSrc = null;
let sourceSlot = null;
let dropSucceeded = false;
let skillID = 0;
const skillTable = {};

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
            img.dataset.skillId = skillID;

            img.addEventListener('dragstart', () => {
                draggedImageSrc = img.getAttribute('src');
                sourceSlot = null;
                dropSucceeded = false;
            });

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

function allowDrop(event) {
    event.preventDefault();
}

function updateUsedSkillLines() {
    generateShareableURL()
    const slots = document.querySelectorAll('.slot');
    const usedClassSkillLines = new Set();

    slots.forEach(slot => {
        const info = slot.dataset.skillInfo;
        if (info) {
            const [skillClass, skillTree] = info.split(':');
            if (['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass)) {
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
            const sourceDataID = sourceSlot.dataset.skillID;
            sourceSlot.dataset.skillInfo = slot.dataset.skillInfo;
            sourceSlot.dataset.skillID = slot.dataset.skillID;
            slot.dataset.skillInfo = sourceData;
            slot.dataset.skillID = sourceDataID;

        } else if (draggedImageSrc) {
            skillElement = document.querySelector(`img[src="${draggedImageSrc}"]`);
            const skillInfo = skillElement?.dataset?.skillInfo || '';
            const skillIDInfo = skillElement?.dataset?.skillID || '';
            slot.innerHTML = `<img src="${draggedImageSrc}">`;
            slot.dataset.skillInfo = skillInfo;
            slot.dataset.skillID = skillIDInfo;
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
        const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass);

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
        const isClassSkill = ['Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer'].includes(skillClass);

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
            'Arcanist', 'Nightblade', 'Templar', 'Dragonknight', 'Sorcerer', 'Warden', 'Necromancer', 'Weapon', 'Armor', 'World', 'Guild', 'Alliance War'
        ];
        const nestedGroups = {};
        Object.entries(skillData).forEach(([fileName, data]) => {
            const mainCat = data.mainCategory;
            const skillClass = data.class;
            const skillTree = data.skillTree;

            if (!nestedGroups[mainCat]) nestedGroups[mainCat] = {};
            if (!nestedGroups[mainCat][skillClass]) nestedGroups[mainCat][skillClass] = {};
            if (!nestedGroups[mainCat][skillClass][skillTree]) nestedGroups[mainCat][skillClass][skillTree] = [];

            nestedGroups[mainCat][skillClass][skillTree].push({
                fileName,
                ...data
            });
        });

        mainCategoryOrder.forEach(mainCat => {
            if (!nestedGroups[mainCat]) return;
            classOrder.forEach(skillClass => {
                const skillTrees = nestedGroups[mainCat][skillClass];
                if (!skillTrees) return;

                if (skillClass === 'Armor') {
                    const treeLabel = document.createElement('div');
                    treeLabel.classList.add('skill-subsubgroup-label');
                    treeLabel.textContent = 'Armour';
                    skillPool.appendChild(treeLabel);

                    const iconContainer = document.createElement('div');
                    iconContainer.classList.add('skill-icon-row');
                    iconContainer.dataset.skillLine = 'Armor';
                    skillPool.appendChild(iconContainer);

                    const allArmorSkills = Object.values(skillTrees).flat();
                    allArmorSkills.sort((a, b) => a.position - b.position);

                    allArmorSkills.forEach(({
                        fileName,
                        skillName
                    }) => {
                        const img = document.createElement('img');
                        img.src = `icons/${fileName}`;
                        img.alt = skillName;
                        img.title = skillName;
                        img.classList.add('skill');
                        img.dataset.skillInfo = `Armor`;
                        img.dataset.skillID = skillID;
                        img.setAttribute('draggable', 'true');
                        skillTable[skillID] = {
                            fileName,
                            skillName,
                            skillClass,
                            skillTree: 'Armor'
                        };

                        img.addEventListener('dragstart', () => {
                            draggedImageSrc = img.getAttribute('src');
                            sourceSlot = null;
                            dropSucceeded = false;
                        });

                        iconContainer.appendChild(img);
                        skillID++;
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
                        skills.forEach(({
                            fileName,
                            skillName
                        }) => {
                            const img = document.createElement('img');
                            img.src = `icons/${fileName}`;
                            img.alt = skillName;
                            img.title = skillName;
                            img.classList.add('skill');
                            img.dataset.skillInfo = `${skillClass}:${skillTree}`;
                            img.dataset.skillID = skillID;
                            img.setAttribute('draggable', 'true');
                            skillTable[skillID] = {
                                fileName,
                                skillName,
                                skillClass,
                                skillTree
                            };

                            img.addEventListener('dragstart', () => {
                                draggedImageSrc = img.getAttribute('src');
                                sourceSlot = null;
                                dropSucceeded = false;
                            });

                            iconContainer.appendChild(img);
                            skillID++;
                        });
                    });
                }
            });
        });
        loadSetupFromURL();
    });