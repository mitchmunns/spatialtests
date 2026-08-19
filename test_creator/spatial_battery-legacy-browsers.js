/************************ 
 * Spatial_Battery *
 ************************/


// store info about the experiment session:
let expName = 'spatial_battery';  // from the Builder filename that created this script
let expInfo = {
    'participant': '',
};

// Start code blocks for 'Before Experiment'
// Run 'Before Experiment' code from code_2
const supabaseScriptPromise = jQuery.getScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");

const SUPABASE_URL = "https://lfboldtuuwfayloofdnm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EfNrQHSaudaeiW-DYB5S0A_W863mPxN";
let supabaseClient;

// Fixed per-test asset locations, keyed by testId. The researcher-configurable
// settings (choices/timing/randomize/etc.) come from the battery config fetched
// at runtime; these attributes never change per battery, so they live here
// instead of being sent over the wire.
const TEST_DEFINITIONS = {
  AC1:  { stim_folder: 'AC1_Stimuli',  stim_file: 'AC1_Stimuli.csv',  type_of_test: 'fill in the blank',    instructions_file: 'AC1_Instructions.csv',  selector_box_image: '',             choices: 0 },
  AC2:  { stim_folder: 'AC1_Stimuli',  stim_file: 'AC1_Stimuli.csv',  type_of_test: 'fill in the blank',    instructions_file: 'AC2_Instructions.csv',  selector_box_image: '',             choices: 0 },
  ACF:  { stim_folder: 'ACF_Stimuli',  stim_file: 'ACF_Stimuli.csv',  type_of_test: 'multiple choice',      instructions_file: 'ACF_Instructions.csv',  selector_box_image: 'selector.png', choices: 2 },
  AO:   { stim_folder: 'AO_Stimuli',   stim_file: 'AO_Stimuli.csv',   type_of_test: 'multiple choice',      instructions_file: 'AO_Instructions.csv',   selector_box_image: 'selector.png', choices: 4 },
  DAT:  { stim_folder: 'DAT_Stimuli',  stim_file: 'DAT_Stimuli.csv',  type_of_test: 'multiple choice',      instructions_file: 'DAT_Instructions.csv',  selector_box_image: 'selector.png', choices: 4 },
  Demos:{ stim_folder: 'Demos_Stimuli',stim_file: 'Demos_Stimuli.csv',type_of_test: 'multiple choice',      instructions_file: 'Demos_Instructions.csv',selector_box_image: 'selector.png', choices: 0 },
  Flags:{ stim_folder: 'Flags_Stimuli',stim_file: 'Flags_Stimuli.csv',type_of_test: 'same different',       instructions_file: 'Flags_Instructions.csv',selector_box_image: 'o_selector.png', choices: 6 },
  MC:   { stim_folder: 'MC_Stimuli',   stim_file: 'MC_Stimuli.csv',   type_of_test: 'multiple choice',      instructions_file: 'MC_Instructions.csv',   selector_box_image: 'selector.png', choices: 5 },
  PFT:  { stim_folder: 'PFT_Stimuli',  stim_file: 'PFT_Stimuli.csv',  type_of_test: 'multiple choice',      instructions_file: 'PFT_Instructions.csv',  selector_box_image: 'selector.png', choices: 5 },
  PSVT: { stim_folder: 'PSVT_Stimuli', stim_file: 'PSVT_Stimuli.csv', type_of_test: 'multiple choice',      instructions_file: 'PSVT_Instructions.csv', selector_box_image: 'selector.png', choices: 5 },
  SBST: { stim_folder: 'SBST_Stimuli', stim_file: 'SBST_Stimuli.csv', type_of_test: 'multiple choice',      instructions_file: 'SBST_Instructions.csv', selector_box_image: 'selector.png', choices: 4 },
  SD:   { stim_folder: 'SD_Stimuli',   stim_file: 'SD_Stimuli.csv',   type_of_test: 'fill in the blank',    instructions_file: 'SD_Instructions.csv',   selector_box_image: '',             choices: 0 },
  VK:   { stim_folder: 'VK_Stimuli',   stim_file: 'VK_Stimuli.csv',   type_of_test: 'multiple selections',  instructions_file: 'VK_Instructions.csv',   selector_box_image: 'x_selector.png', choices: 4 },
  WS:   { stim_folder: 'WS_Stimuli',   stim_file: 'WS_Stimuli.csv',   type_of_test: 'multiple choice',      instructions_file: 'WS_Instructions.csv',   selector_box_image: 'selector.png', choices: 5 },
};

// Researcher-authored custom tests (battery item testIds prefixed 'custom:')
// have no fixed stim_folder/instructions of their own — they share one
// generic instructions page (see custom_instructions.csv) and a
// type-appropriate selector graphic already shipped for the matching
// built-in answer type, instead of a bespoke per-test asset set.
const CUSTOM_INSTRUCTIONS_FILE = 'custom_instructions.csv';
const CUSTOM_SELECTOR_BY_TYPE = {
  'multiple choice': 'selector.png',
  'multiple selections': 'x_selector.png',
  'same different': 'o_selector.png',
  'fill in the blank': '',
};
// Bare custom_tests.id -> the fetched row, populated once in prepareAndStart()
// before buildTestListRows()/resourcesForTests() run.
let customTestDefs = {};

// Falls back to the static test_list.csv (today's default battery) whenever
// there's no ?session= param, or the battery config can't be fetched.
var testListRows = 'test_list.csv';

// Researcher-customizable text for the between-tests break screen (see
// score_breakRoutineBegin below). null = use the built-in default copy.
// customBreakMessageCounter supports {completed}/{total} tokens.
var customBreakMessage = null;
var customBreakMessageCounter = null;

function buildTestListRows(items) {
  return items.map((item, index) => {
    const isCustom = typeof item.testId === 'string' && item.testId.indexOf('custom:') === 0;
    let def, customItems = null;
    if (isCustom) {
      const bareId = item.testId.slice('custom:'.length);
      const custom = customTestDefs[bareId];
      if (!custom) {
        console.error('Unknown custom testId in battery config, skipping:', item.testId);
        return null;
      }
      def = {
        stim_folder: '',
        stim_file: '',
        type_of_test: custom.type_of_test,
        instructions_file: CUSTOM_INSTRUCTIONS_FILE,
        selector_box_image: CUSTOM_SELECTOR_BY_TYPE[custom.type_of_test] || '',
        choices: custom.choices,
      };
      customItems = custom.items;
    } else {
      def = TEST_DEFINITIONS[item.testId];
      if (!def) {
        console.error('Unknown testId in battery config, skipping:', item.testId);
        return null;
      }
    }
    const params = item.params || {};
    return {
      name_of_test: item.testId,
      stim_folder: def.stim_folder,
      stim_file: def.stim_file,
      type_of_test: def.type_of_test,
      instructions_file: def.instructions_file,
      selector_box_image: def.selector_box_image,
      choices: def.choices,
      // Only populated for custom tests — item_loop builds its trial list
      // directly from this in-memory array instead of importing a CSV.
      custom_items: customItems,
      time_min: params.timeMin,
      time_max: params.timeMax,
      total_time_limit: params.totalTimeLimit || 0,
      randomize: params.randomizeItems ? 1 : 0,
      // 'R' throws this test into the shuffled pool (see set_vars's block-order
      // logic below); a number pins it to that absolute slot in the final
      // running order, same as the original test_list.csv convention.
      test_order: params.randomizeOrder ? 'R' : index,
      prev_scores: '[]',
      include_score: params.includeScore ? 1 : 0,
      selectedItems: params.selectedItems,
      itemCount: params.itemCount,
      custom_instructions: params.customInstructions ? 1 : 0,
      custom_instructions_text: params.customInstructionsText || '',
    };
  }).filter(row => row !== null);
}

// The real number of items a participant will run for this test — specific
// picks override the count field, same rule the item_loop trimming logic
// below uses, so the token always matches what's actually administered.
function effectiveItemCount(){
  const selected = test_loop.thisTrial['selectedItems'];
  if (Array.isArray(selected) && selected.length > 0) return selected.length;
  return test_loop.thisTrial['itemCount'];
}

// Fills {itemCount}/{timeMin} tokens with this test's actual configured
// values. Strips the *word* italics markup from the builder preview rather
// than rendering it — PsychoJS TextStim doesn't support mixed formatting
// within one stim, so this shows plain text for now.
function renderCustomInstructionsText(rawText){
  return String(rawText || '')
    .replace(/\{itemCount\}/g, effectiveItemCount())
    .replace(/\{timeMin\}/g, test_loop.thisTrial['time_min'])
    .replace(/\*([^*\n]+)\*/g, '$1');
}

const ALL_RESOURCES = [
    // resources:
    {'name': 'test_list.csv', 'path': 'test_list.csv'},
    {'name': 'SBST_Stimuli.csv', 'path': 'SBST_Stimuli.csv'},
    {'name': 'SBST_Instructions.csv', 'path': 'SBST_Instructions.csv'},
    {'name': 'selector.png', 'path': 'selector.png'},
    {'name': 'test_list.csv', 'path': 'test_list.csv'},
    {'name': 'SBST_Stimuli.csv', 'path': 'SBST_Stimuli.csv'},
    {'name': 'SBST_Instructions.csv', 'path': 'SBST_Instructions.csv'},
    {'name': 'selector.png', 'path': 'selector.png'},
    {'name': 'intro.png', 'path': 'intro.png'},
    {'name': 'break_image.png', 'path': 'break_image.png'},
    {'name': 'Demos_Stimuli/D_physics.png', 'path': 'Demos_Stimuli/D_physics.png'},
    {'name': 'AC1_Stimuli/AC_2.png', 'path': 'AC1_Stimuli/AC_2.png'},
    {'name': 'AC1_Stimuli/AC_1.png', 'path': 'AC1_Stimuli/AC_1.png'},
    {'name': 'ACF_Stimuli/ACF_Final.png', 'path': 'ACF_Stimuli/ACF_Final.png'},
    {'name': 'ACF_Stimuli/ACF_Final2.png', 'path': 'ACF_Stimuli/ACF_Final2.png'},
    {'name': 'WS_Stimuli/WS_1.png', 'path': 'WS_Stimuli/WS_1.png'},
    {'name': 'WS_Stimuli/WS_2.png', 'path': 'WS_Stimuli/WS_2.png'},
    {'name': 'WS_Stimuli/WS_3.png', 'path': 'WS_Stimuli/WS_3.png'},
    {'name': 'WS_Stimuli/WS_4.png', 'path': 'WS_Stimuli/WS_4.png'},
    {'name': 'WS_Stimuli/WS_5.png', 'path': 'WS_Stimuli/WS_5.png'},
    {'name': 'WS_Stimuli/WS_6.png', 'path': 'WS_Stimuli/WS_6.png'},
    {'name': 'WS_Stimuli/WS_7.png', 'path': 'WS_Stimuli/WS_7.png'},
    {'name': 'WS_Stimuli/WS_8.png', 'path': 'WS_Stimuli/WS_8.png'},
    {'name': 'WS_Stimuli/WS_9.png', 'path': 'WS_Stimuli/WS_9.png'},
    {'name': 'WS_Stimuli/WS_10.png', 'path': 'WS_Stimuli/WS_10.png'},
    {'name': 'WS_Stimuli/WS_11.png', 'path': 'WS_Stimuli/WS_11.png'},
    {'name': 'WS_Stimuli/WS_12.png', 'path': 'WS_Stimuli/WS_12.png'},
    {'name': 'WS_Stimuli/WS_13.png', 'path': 'WS_Stimuli/WS_13.png'},
    {'name': 'WS_Stimuli/WS_14.png', 'path': 'WS_Stimuli/WS_14.png'},
    {'name': 'WS_Stimuli/WS_Instructions1.png', 'path': 'WS_Stimuli/WS_Instructions1.png'},
    {'name': 'AO_Stimuli/AO_1.png', 'path': 'AO_Stimuli/AO_1.png'},
    {'name': 'AO_Stimuli/AO_2.png', 'path': 'AO_Stimuli/AO_2.png'},
    {'name': 'AO_Stimuli/AO_3.png', 'path': 'AO_Stimuli/AO_3.png'},
    {'name': 'AO_Stimuli/AO_4.png', 'path': 'AO_Stimuli/AO_4.png'},
    {'name': 'AO_Stimuli/AO_5.png', 'path': 'AO_Stimuli/AO_5.png'},
    {'name': 'AO_Stimuli/AO_6.png', 'path': 'AO_Stimuli/AO_6.png'},
    {'name': 'AO_Stimuli/AO_7.png', 'path': 'AO_Stimuli/AO_7.png'},
    {'name': 'AO_Stimuli/AO_8.png', 'path': 'AO_Stimuli/AO_8.png'},
    {'name': 'AO_Stimuli/AO_9.png', 'path': 'AO_Stimuli/AO_9.png'},
    {'name': 'AO_Stimuli/AO_10.png', 'path': 'AO_Stimuli/AO_10.png'},
    {'name': 'AO_Stimuli/AO_11.png', 'path': 'AO_Stimuli/AO_11.png'},
    {'name': 'AO_Stimuli/AO_12.png', 'path': 'AO_Stimuli/AO_12.png'},
    {'name': 'AO_Stimuli/AO_13.png', 'path': 'AO_Stimuli/AO_13.png'},
    {'name': 'AO_Stimuli/AO_14.png', 'path': 'AO_Stimuli/AO_14.png'},
    {'name': 'AO_Stimuli/AO_15.png', 'path': 'AO_Stimuli/AO_15.png'},
    {'name': 'AO_Stimuli/AO_16.png', 'path': 'AO_Stimuli/AO_16.png'},
    {'name': 'AO_Stimuli/AO_17.png', 'path': 'AO_Stimuli/AO_17.png'},
    {'name': 'AO_Stimuli/AO_18.png', 'path': 'AO_Stimuli/AO_18.png'},
    {'name': 'AO_Stimuli/AO_19.png', 'path': 'AO_Stimuli/AO_19.png'},
    {'name': 'AO_Stimuli/AO_20.png', 'path': 'AO_Stimuli/AO_20.png'},
    {'name': 'AO_Stimuli/AO_21.png', 'path': 'AO_Stimuli/AO_21.png'},
    {'name': 'AO_Stimuli/AO_22.png', 'path': 'AO_Stimuli/AO_22.png'},
    {'name': 'AO_Stimuli/AO_23.png', 'path': 'AO_Stimuli/AO_23.png'},
    {'name': 'AO_Stimuli/AO_24.png', 'path': 'AO_Stimuli/AO_24.png'},
    {'name': 'AO_Stimuli/AO_25.png', 'path': 'AO_Stimuli/AO_25.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions5.png', 'path': 'PSVT_Stimuli/PSVT_Instructions5.png'},
    {'name': 'VK_Stimuli/VK_Instructions4R.png', 'path': 'VK_Stimuli/VK_Instructions4R.png'},
    {'name': 'SD_Stimuli/SD_Instructions3R.png', 'path': 'SD_Stimuli/SD_Instructions3R.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2R.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2R.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions3R.png', 'path': 'PSVT_Stimuli/PSVT_Instructions3R.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2R.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2R.png'},
    {'name': 'MC_Stimuli/MC_Instructions3R.png', 'path': 'MC_Stimuli/MC_Instructions3R.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions4R.png', 'path': 'Flags_Stimuli/Flags_Instructions4R.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions3R.png', 'path': 'DAT_Stimuli/DAT_Instructions3R.png'},
    {'name': 'AO_Stimuli/AO_Instructions1.png', 'path': 'AO_Stimuli/AO_Instructions1.png'},
    {'name': 'AO_Stimuli/AO_Instructions2.png', 'path': 'AO_Stimuli/AO_Instructions2.png'},
    {'name': 'AO_Stimuli/AO_Instructions3.png', 'path': 'AO_Stimuli/AO_Instructions3.png'},
    {'name': 'AO_Stimuli/AO_Instructions3F.png', 'path': 'AO_Stimuli/AO_Instructions3F.png'},
    {'name': 'AO_Stimuli/AO_Instructions3F2.png', 'path': 'AO_Stimuli/AO_Instructions3F2.png'},
    {'name': 'AO_Stimuli/AO_Instructions3R.png', 'path': 'AO_Stimuli/AO_Instructions3R.png'},
    {'name': 'AO_Stimuli/AO_Instructions4.png', 'path': 'AO_Stimuli/AO_Instructions4.png'},
    {'name': 'AO_Stimuli/AO_Instructions5.png', 'path': 'AO_Stimuli/AO_Instructions5.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions3F2.png', 'path': 'PSVT_Stimuli/PSVT_Instructions3F2.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions3F.png', 'path': 'PSVT_Stimuli/PSVT_Instructions3F.png'},
    {'name': 'Demos_Stimuli/D_Instructions1.png', 'path': 'Demos_Stimuli/D_Instructions1.png'},
    {'name': 'Demos_Stimuli/D_age.png', 'path': 'Demos_Stimuli/D_age.png'},
    {'name': 'Demos_Stimuli/D_ethnicity.png', 'path': 'Demos_Stimuli/D_ethnicity.png'},
    {'name': 'Demos_Stimuli/D_GPA.png', 'path': 'Demos_Stimuli/D_GPA.png'},
    {'name': 'Demos_Stimuli/D_language.png', 'path': 'Demos_Stimuli/D_language.png'},
    {'name': 'Demos_Stimuli/D_math.png', 'path': 'Demos_Stimuli/D_math.png'},
    {'name': 'Demos_Stimuli/D_parents_ed.png', 'path': 'Demos_Stimuli/D_parents_ed.png'},
    {'name': 'Demos_Stimuli/D_race.png', 'path': 'Demos_Stimuli/D_race.png'},
    {'name': 'Demos_Stimuli/D_sex.png', 'path': 'Demos_Stimuli/D_sex.png'},
    {'name': 'Demos_Stimuli/D_vision.png', 'path': 'Demos_Stimuli/D_vision.png'},
    {'name': 'VK_Stimuli/VK_Instructions4F.png', 'path': 'VK_Stimuli/VK_Instructions4F.png'},
    {'name': 'VK_Stimuli/VK_Instructions4F2.png', 'path': 'VK_Stimuli/VK_Instructions4F2.png'},
    {'name': 'SD_Stimuli/SD_Instructions3F.png', 'path': 'SD_Stimuli/SD_Instructions3F.png'},
    {'name': 'SD_Stimuli/SD_Instructions3F2.png', 'path': 'SD_Stimuli/SD_Instructions3F2.png'},
    {'name': 'SD_Stimuli/SD_Instructions5.png', 'path': 'SD_Stimuli/SD_Instructions5.png'},
    {'name': 'PFT_Stimuli/PFT_Instructions3.png', 'path': 'PFT_Stimuli/PFT_Instructions3.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2F.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2F.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2F2.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2F2.png'},
    {'name': 'MC_Stimuli/MC_Instructions3F.png', 'path': 'MC_Stimuli/MC_Instructions3F.png'},
    {'name': 'MC_Stimuli/MC_Instructions3F2.png', 'path': 'MC_Stimuli/MC_Instructions3F2.png'},
    {'name': 'MC_Stimuli/MC_Instructions5.png', 'path': 'MC_Stimuli/MC_Instructions5.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions4F.png', 'path': 'Flags_Stimuli/Flags_Instructions4F.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions4F2.png', 'path': 'Flags_Stimuli/Flags_Instructions4F2.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions3F.png', 'path': 'DAT_Stimuli/DAT_Instructions3F.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions3F2.png', 'path': 'DAT_Stimuli/DAT_Instructions3F2.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions5.png', 'path': 'DAT_Stimuli/DAT_Instructions5.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2F.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2F.png'},
    {'name': 'PFT_Stimuli/PFT_InstructionsP2F2.png', 'path': 'PFT_Stimuli/PFT_InstructionsP2F2.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2F.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2F.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2F2.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2F2.png'},
    {'name': 'SBST_Stimuli/SBST_12.png', 'path': 'SBST_Stimuli/SBST_12.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2.png'},
    {'name': 'SBST_Stimuli/SBST_InstructionsP2F.png', 'path': 'SBST_Stimuli/SBST_InstructionsP2F.png'},
    {'name': 'MC_Instructions.csv', 'path': 'MC_Instructions.csv'},
    {'name': 'MC_Stimuli.csv', 'path': 'MC_Stimuli.csv'},
    {'name': 'SBST_Instructions.csv', 'path': 'SBST_Instructions.csv'},
    {'name': 'SBST_Stimuli.csv', 'path': 'SBST_Stimuli.csv'},
    {'name': 'SBST_Stimuli/SBST_1.png', 'path': 'SBST_Stimuli/SBST_1.png'},
    {'name': 'SBST_Stimuli/SBST_4.png', 'path': 'SBST_Stimuli/SBST_4.png'},
    {'name': 'SBST_Stimuli/SBST_5.png', 'path': 'SBST_Stimuli/SBST_5.png'},
    {'name': 'SBST_Stimuli/SBST_6.png', 'path': 'SBST_Stimuli/SBST_6.png'},
    {'name': 'SBST_Stimuli/SBST_7.png', 'path': 'SBST_Stimuli/SBST_7.png'},
    {'name': 'SBST_Stimuli/SBST_10.png', 'path': 'SBST_Stimuli/SBST_10.png'},
    {'name': 'SBST_Stimuli/SBST_13.png', 'path': 'SBST_Stimuli/SBST_13.png'},
    {'name': 'SBST_Stimuli/SBST_17.png', 'path': 'SBST_Stimuli/SBST_17.png'},
    {'name': 'SBST_Stimuli/SBST_19.png', 'path': 'SBST_Stimuli/SBST_19.png'},
    {'name': 'SBST_Stimuli/SBST_21.png', 'path': 'SBST_Stimuli/SBST_21.png'},
    {'name': 'SBST_Stimuli/SBST_22.png', 'path': 'SBST_Stimuli/SBST_22.png'},
    {'name': 'SBST_Stimuli/SBST_24.png', 'path': 'SBST_Stimuli/SBST_24.png'},
    {'name': 'SBST_Stimuli/SBST_25.png', 'path': 'SBST_Stimuli/SBST_25.png'},
    {'name': 'SBST_Stimuli/SBST_27.png', 'path': 'SBST_Stimuli/SBST_27.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions1.png', 'path': 'SBST_Stimuli/SBST_Instructions1.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions2.png', 'path': 'SBST_Stimuli/SBST_Instructions2.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions3.png', 'path': 'SBST_Stimuli/SBST_Instructions3.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions4.png', 'path': 'SBST_Stimuli/SBST_Instructions4.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions5.png', 'path': 'SBST_Stimuli/SBST_Instructions5.png'},
    {'name': 'SBST_Stimuli/SBST_Instructions6.png', 'path': 'SBST_Stimuli/SBST_Instructions6.png'},
    {'name': 'MC_Stimuli/MC_Instructions1.png', 'path': 'MC_Stimuli/MC_Instructions1.png'},
    {'name': 'MC_Stimuli/MC_Instructions2.png', 'path': 'MC_Stimuli/MC_Instructions2.png'},
    {'name': 'MC_Stimuli/MC_Instructions3.png', 'path': 'MC_Stimuli/MC_Instructions3.png'},
    {'name': 'MC_Stimuli/MC_Instructions4.png', 'path': 'MC_Stimuli/MC_Instructions4.png'},
    {'name': 'MC_Stimuli/MC1.png', 'path': 'MC_Stimuli/MC1.png'},
    {'name': 'MC_Stimuli/MC2.png', 'path': 'MC_Stimuli/MC2.png'},
    {'name': 'MC_Stimuli/MC3.png', 'path': 'MC_Stimuli/MC3.png'},
    {'name': 'MC_Stimuli/MC4.png', 'path': 'MC_Stimuli/MC4.png'},
    {'name': 'MC_Stimuli/MC5.png', 'path': 'MC_Stimuli/MC5.png'},
    {'name': 'MC_Stimuli/MC6.png', 'path': 'MC_Stimuli/MC6.png'},
    {'name': 'MC_Stimuli/MC7.png', 'path': 'MC_Stimuli/MC7.png'},
    {'name': 'MC_Stimuli/MC8.png', 'path': 'MC_Stimuli/MC8.png'},
    {'name': 'MC_Stimuli/MC9.png', 'path': 'MC_Stimuli/MC9.png'},
    {'name': 'MC_Stimuli/MC10.png', 'path': 'MC_Stimuli/MC10.png'},
    {'name': 'MC_Stimuli/MC11.png', 'path': 'MC_Stimuli/MC11.png'},
    {'name': 'MC_Stimuli/MC12.png', 'path': 'MC_Stimuli/MC12.png'},
    {'name': 'MC_Stimuli/MC13.png', 'path': 'MC_Stimuli/MC13.png'},
    {'name': 'MC_Stimuli/MC14.png', 'path': 'MC_Stimuli/MC14.png'},
    {'name': 'MC_Stimuli/MC15.png', 'path': 'MC_Stimuli/MC15.png'},
    {'name': 'MC_Stimuli/MC16.png', 'path': 'MC_Stimuli/MC16.png'},
    {'name': 'MC_Stimuli/MC17.png', 'path': 'MC_Stimuli/MC17.png'},
    {'name': 'MC_Stimuli/MC18.png', 'path': 'MC_Stimuli/MC18.png'},
    {'name': 'MC_Stimuli/MC19.png', 'path': 'MC_Stimuli/MC19.png'},
    {'name': 'MC_Stimuli/MC20.png', 'path': 'MC_Stimuli/MC20.png'},
    {'name': 'MC_Stimuli/MC21.png', 'path': 'MC_Stimuli/MC21.png'},
    {'name': 'MC_Stimuli/MC22.png', 'path': 'MC_Stimuli/MC22.png'},
    {'name': 'MC_Stimuli/MC23.png', 'path': 'MC_Stimuli/MC23.png'},
    {'name': 'MC_Stimuli/MC24.png', 'path': 'MC_Stimuli/MC24.png'},
    {'name': 'MC_Stimuli/MC25.png', 'path': 'MC_Stimuli/MC25.png'},
    {'name': 'MC_Stimuli/PR_1.png', 'path': 'MC_Stimuli/PR_1.png'},
    {'name': 'MC_Stimuli/PR_2.png', 'path': 'MC_Stimuli/PR_2.png'},
    {'name': 'MC_Stimuli/PR_3.png', 'path': 'MC_Stimuli/PR_3.png'},
    {'name': 'MC_Stimuli/PR_4.png', 'path': 'MC_Stimuli/PR_4.png'},
    {'name': 'MC_Stimuli/PR_8.png', 'path': 'MC_Stimuli/PR_8.png'},
    {'name': 'MC_Stimuli/PR_10.png', 'path': 'MC_Stimuli/PR_10.png'},
    {'name': 'MC_Stimuli/PR_11.png', 'path': 'MC_Stimuli/PR_11.png'},
    {'name': 'MC_Stimuli/PR_13.png', 'path': 'MC_Stimuli/PR_13.png'},
    {'name': 'MC_Stimuli/PR_14.png', 'path': 'MC_Stimuli/PR_14.png'},
    {'name': 'MC_Stimuli/PR_15.png', 'path': 'MC_Stimuli/PR_15.png'},
    {'name': 'break_image.png', 'path': 'break_image.png'},
    {'name': 'x_selector.png', 'path': 'x_selector.png'},
    {'name': 'o_selector.png', 'path': 'o_selector.png'},
    {'name': 'DAT_Stimuli/DAT_6.png', 'path': 'DAT_Stimuli/DAT_6.png'},
    {'name': 'DAT_Stimuli/DAT_10.png', 'path': 'DAT_Stimuli/DAT_10.png'},
    {'name': 'DAT_Stimuli/DAT_13.png', 'path': 'DAT_Stimuli/DAT_13.png'},
    {'name': 'DAT_Stimuli/DAT_16.png', 'path': 'DAT_Stimuli/DAT_16.png'},
    {'name': 'DAT_Stimuli/DAT_23.png', 'path': 'DAT_Stimuli/DAT_23.png'},
    {'name': 'DAT_Stimuli/DAT_37.png', 'path': 'DAT_Stimuli/DAT_37.png'},
    {'name': 'DAT_Stimuli/DAT_39.png', 'path': 'DAT_Stimuli/DAT_39.png'},
    {'name': 'DAT_Stimuli/DAT_42.png', 'path': 'DAT_Stimuli/DAT_42.png'},
    {'name': 'DAT_Stimuli/DAT_43.png', 'path': 'DAT_Stimuli/DAT_43.png'},
    {'name': 'DAT_Stimuli/DAT_44.png', 'path': 'DAT_Stimuli/DAT_44.png'},
    {'name': 'DAT_Stimuli/DAT_46.png', 'path': 'DAT_Stimuli/DAT_46.png'},
    {'name': 'DAT_Stimuli/DAT_49.png', 'path': 'DAT_Stimuli/DAT_49.png'},
    {'name': 'PSVT_Stimuli/PSVT_1.png', 'path': 'PSVT_Stimuli/PSVT_1.png'},
    {'name': 'PSVT_Stimuli/PSVT_2.png', 'path': 'PSVT_Stimuli/PSVT_2.png'},
    {'name': 'PSVT_Stimuli/PSVT_3.png', 'path': 'PSVT_Stimuli/PSVT_3.png'},
    {'name': 'PSVT_Stimuli/PSVT_4.png', 'path': 'PSVT_Stimuli/PSVT_4.png'},
    {'name': 'PSVT_Stimuli/PSVT_5.png', 'path': 'PSVT_Stimuli/PSVT_5.png'},
    {'name': 'PSVT_Stimuli/PSVT_6.png', 'path': 'PSVT_Stimuli/PSVT_6.png'},
    {'name': 'PSVT_Stimuli/PSVT_7.png', 'path': 'PSVT_Stimuli/PSVT_7.png'},
    {'name': 'PSVT_Stimuli/PSVT_12.png', 'path': 'PSVT_Stimuli/PSVT_12.png'},
    {'name': 'PSVT_Stimuli/PSVT_13.png', 'path': 'PSVT_Stimuli/PSVT_13.png'},
    {'name': 'PSVT_Stimuli/PSVT_14.png', 'path': 'PSVT_Stimuli/PSVT_14.png'},
    {'name': 'PSVT_Stimuli/PSVT_18.png', 'path': 'PSVT_Stimuli/PSVT_18.png'},
    {'name': 'PSVT_Stimuli/PSVT_21.png', 'path': 'PSVT_Stimuli/PSVT_21.png'},
    {'name': 'PSVT_Stimuli/PSVT_24.png', 'path': 'PSVT_Stimuli/PSVT_24.png'},
    {'name': 'PSVT_Stimuli/PSVT_26.png', 'path': 'PSVT_Stimuli/PSVT_26.png'},
    {'name': 'PSVT_Stimuli/PSVT_28.png', 'path': 'PSVT_Stimuli/PSVT_28.png'},
    {'name': 'VK_Stimuli/VK_1.png', 'path': 'VK_Stimuli/VK_1.png'},
    {'name': 'VK_Stimuli/VK_2.png', 'path': 'VK_Stimuli/VK_2.png'},
    {'name': 'VK_Stimuli/VK_5.png', 'path': 'VK_Stimuli/VK_5.png'},
    {'name': 'VK_Stimuli/VK_6.png', 'path': 'VK_Stimuli/VK_6.png'},
    {'name': 'VK_Stimuli/VK_9.png', 'path': 'VK_Stimuli/VK_9.png'},
    {'name': 'VK_Stimuli/VK_10.png', 'path': 'VK_Stimuli/VK_10.png'},
    {'name': 'VK_Stimuli/VK_13.png', 'path': 'VK_Stimuli/VK_13.png'},
    {'name': 'VK_Stimuli/VK_14.png', 'path': 'VK_Stimuli/VK_14.png'},
    {'name': 'VK_Stimuli/VK_17.png', 'path': 'VK_Stimuli/VK_17.png'},
    {'name': 'VK_Stimuli/VK_18.png', 'path': 'VK_Stimuli/VK_18.png'},
    {'name': 'VK_Stimuli/VK_Instructions1.png', 'path': 'VK_Stimuli/VK_Instructions1.png'},
    {'name': 'VK_Stimuli/VK_Instructions2.png', 'path': 'VK_Stimuli/VK_Instructions2.png'},
    {'name': 'VK_Stimuli/VK_Instructions3.png', 'path': 'VK_Stimuli/VK_Instructions3.png'},
    {'name': 'VK_Stimuli/VK_Instructions4.png', 'path': 'VK_Stimuli/VK_Instructions4.png'},
    {'name': 'VK_Stimuli/VK_Instructions5.png', 'path': 'VK_Stimuli/VK_Instructions5.png'},
    {'name': 'VK_Stimuli/VK_Instructions6.png', 'path': 'VK_Stimuli/VK_Instructions6.png'},
    {'name': 'VK_Stimuli/VK_Instructions7.png', 'path': 'VK_Stimuli/VK_Instructions7.png'},
    {'name': 'VK_Stimuli/VK_Instructions8.png', 'path': 'VK_Stimuli/VK_Instructions8.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions1.png', 'path': 'PSVT_Stimuli/PSVT_Instructions1.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions2.png', 'path': 'PSVT_Stimuli/PSVT_Instructions2.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions3.png', 'path': 'PSVT_Stimuli/PSVT_Instructions3.png'},
    {'name': 'PSVT_Stimuli/PSVT_Instructions4.png', 'path': 'PSVT_Stimuli/PSVT_Instructions4.png'},
    {'name': 'SD_Stimuli/SD_1.png', 'path': 'SD_Stimuli/SD_1.png'},
    {'name': 'SD_Stimuli/SD_2.png', 'path': 'SD_Stimuli/SD_2.png'},
    {'name': 'SD_Stimuli/SD_3.png', 'path': 'SD_Stimuli/SD_3.png'},
    {'name': 'SD_Stimuli/SD_5.png', 'path': 'SD_Stimuli/SD_5.png'},
    {'name': 'SD_Stimuli/SD_7.png', 'path': 'SD_Stimuli/SD_7.png'},
    {'name': 'SD_Stimuli/SD_8.png', 'path': 'SD_Stimuli/SD_8.png'},
    {'name': 'SD_Stimuli/SD_9.png', 'path': 'SD_Stimuli/SD_9.png'},
    {'name': 'SD_Stimuli/SD_10.png', 'path': 'SD_Stimuli/SD_10.png'},
    {'name': 'SD_Stimuli/SD_11.png', 'path': 'SD_Stimuli/SD_11.png'},
    {'name': 'SD_Stimuli/SD_12.png', 'path': 'SD_Stimuli/SD_12.png'},
    {'name': 'SD_Stimuli/SD_Instructions1.png', 'path': 'SD_Stimuli/SD_Instructions1.png'},
    {'name': 'SD_Stimuli/SD_Instructions2.png', 'path': 'SD_Stimuli/SD_Instructions2.png'},
    {'name': 'SD_Stimuli/SD_Instructions3.png', 'path': 'SD_Stimuli/SD_Instructions3.png'},
    {'name': 'SD_Stimuli/SD_Instructions4.png', 'path': 'SD_Stimuli/SD_Instructions4.png'},
    {'name': 'SD_Stimuli/SD_Instructions5.png', 'path': 'SD_Stimuli/SD_Instructions5.png'},
    {'name': 'PFT_Stimuli/PFT_2.png', 'path': 'PFT_Stimuli/PFT_2.png'},
    {'name': 'PFT_Stimuli/PFT_3.png', 'path': 'PFT_Stimuli/PFT_3.png'},
    {'name': 'PFT_Stimuli/PFT_5.png', 'path': 'PFT_Stimuli/PFT_5.png'},
    {'name': 'PFT_Stimuli/PFT_7.png', 'path': 'PFT_Stimuli/PFT_7.png'},
    {'name': 'PFT_Stimuli/PFT_9.png', 'path': 'PFT_Stimuli/PFT_9.png'},
    {'name': 'PFT_Stimuli/PFT_12.png', 'path': 'PFT_Stimuli/PFT_12.png'},
    {'name': 'PFT_Stimuli/PFT_13.png', 'path': 'PFT_Stimuli/PFT_13.png'},
    {'name': 'PFT_Stimuli/PFT_16.png', 'path': 'PFT_Stimuli/PFT_16.png'},
    {'name': 'PFT_Stimuli/PFT_17.png', 'path': 'PFT_Stimuli/PFT_17.png'},
    {'name': 'PFT_Stimuli/PFT_19.png', 'path': 'PFT_Stimuli/PFT_19.png'},
    {'name': 'PFT_Stimuli/PFT_Instructions1.png', 'path': 'PFT_Stimuli/PFT_Instructions1.png'},
    {'name': 'PFT_Stimuli/PFT_Instructions2.png', 'path': 'PFT_Stimuli/PFT_Instructions2.png'},
    {'name': 'PFT_Stimuli/PFT_Instructions3.png', 'path': 'PFT_Stimuli/PFT_Instructions3.png'},
    {'name': 'Flags_Stimuli/F_1.png', 'path': 'Flags_Stimuli/F_1.png'},
    {'name': 'Flags_Stimuli/F_2.png', 'path': 'Flags_Stimuli/F_2.png'},
    {'name': 'Flags_Stimuli/F_6.png', 'path': 'Flags_Stimuli/F_6.png'},
    {'name': 'Flags_Stimuli/F_13.png', 'path': 'Flags_Stimuli/F_13.png'},
    {'name': 'Flags_Stimuli/F_15.png', 'path': 'Flags_Stimuli/F_15.png'},
    {'name': 'Flags_Stimuli/F_16.png', 'path': 'Flags_Stimuli/F_16.png'},
    {'name': 'Flags_Stimuli/F_17.png', 'path': 'Flags_Stimuli/F_17.png'},
    {'name': 'Flags_Stimuli/F_18.png', 'path': 'Flags_Stimuli/F_18.png'},
    {'name': 'Flags_Stimuli/F_19.png', 'path': 'Flags_Stimuli/F_19.png'},
    {'name': 'Flags_Stimuli/F_20.png', 'path': 'Flags_Stimuli/F_20.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions1.png', 'path': 'Flags_Stimuli/Flags_Instructions1.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions2.png', 'path': 'Flags_Stimuli/Flags_Instructions2.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions3.png', 'path': 'Flags_Stimuli/Flags_Instructions3.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions4.png', 'path': 'Flags_Stimuli/Flags_Instructions4.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions5.png', 'path': 'Flags_Stimuli/Flags_Instructions5.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions6.png', 'path': 'Flags_Stimuli/Flags_Instructions6.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions7.png', 'path': 'Flags_Stimuli/Flags_Instructions7.png'},
    {'name': 'Flags_Stimuli/Flags_Instructions8.png', 'path': 'Flags_Stimuli/Flags_Instructions8.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions1.png', 'path': 'DAT_Stimuli/DAT_Instructions1.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions2.png', 'path': 'DAT_Stimuli/DAT_Instructions2.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions3.png', 'path': 'DAT_Stimuli/DAT_Instructions3.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions4.png', 'path': 'DAT_Stimuli/DAT_Instructions4.png'},
    {'name': 'DAT_Stimuli/DAT_Instructions5.png', 'path': 'DAT_Stimuli/DAT_Instructions5.png'},
    {'name': 'DAT_Instructions.csv', 'path': 'DAT_Instructions.csv'},
    {'name': 'DAT_Stimuli.csv', 'path': 'DAT_Stimuli.csv'},
    {'name': 'PFT_Instructions.csv', 'path': 'PFT_Instructions.csv'},
    {'name': 'PFT_Stimuli.csv', 'path': 'PFT_Stimuli.csv'},
    {'name': 'PSVT_Instructions.csv', 'path': 'PSVT_Instructions.csv'},
    {'name': 'PSVT_Stimuli.csv', 'path': 'PSVT_Stimuli.csv'},
    {'name': 'SD_Instructions.csv', 'path': 'SD_Instructions.csv'},
    {'name': 'SD_Stimuli.csv', 'path': 'SD_Stimuli.csv'},
    {'name': 'selector.png', 'path': 'selector.png'},
    {'name': 'test_list.csv', 'path': 'test_list.csv'},
    {'name': 'VK_Instructions.csv', 'path': 'VK_Instructions.csv'},
    {'name': 'VK_Stimuli.csv', 'path': 'VK_Stimuli.csv'},
];


// init psychoJS:
const psychoJS = new PsychoJS({
  debug: true
});

// open window:
psychoJS.openWindow({
  fullscr: true,
  color: new util.Color([1.0, 1.0, 1.0]),
  units: 'pix',
  waitBlanking: true,
  backgroundImage: '',
  backgroundFit: 'none',
});
// schedule the experiment:
psychoJS.schedule(psychoJS.gui.DlgFromDict({
  dictionary: expInfo,
  title: expName
}));

const flowScheduler = new Scheduler(psychoJS);
const dialogCancelScheduler = new Scheduler(psychoJS);
psychoJS.scheduleCondition(function() { return (psychoJS.gui.dialogComponent.button === 'OK'); },flowScheduler, dialogCancelScheduler);

// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
const init_loopLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(init_loopLoopBegin(init_loopLoopScheduler));
flowScheduler.add(init_loopLoopScheduler);
flowScheduler.add(init_loopLoopEnd);


// Intro screen (time-estimate/effort warning before the battery starts) is
// disabled for now — routine is still defined below so it's easy to make
// this a per-battery researcher toggle later.
// flowScheduler.add(intro_screenRoutineBegin());
// flowScheduler.add(intro_screenRoutineEachFrame());
// flowScheduler.add(intro_screenRoutineEnd());
const test_loopLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(test_loopLoopBegin(test_loopLoopScheduler));
flowScheduler.add(test_loopLoopScheduler);
flowScheduler.add(test_loopLoopEnd);












flowScheduler.add(feedbackRoutineBegin());
flowScheduler.add(feedbackRoutineEachFrame());
flowScheduler.add(feedbackRoutineEnd());
flowScheduler.add(endRoutineBegin());
flowScheduler.add(endRoutineEachFrame());
flowScheduler.add(endRoutineEnd());
flowScheduler.add(quitPsychoJS, '', true);

// quit if user presses Cancel in dialog box:
dialogCancelScheduler.add(quitPsychoJS, '', false);

const SHARED_RESOURCE_NAMES = ['test_list.csv', 'selector.png', 'x_selector.png', 'intro.png', 'break_image.png'];

// Given the testIds in a dynamic battery, returns just the resources needed
// for those tests (their top-level CSVs, built directly from TEST_DEFINITIONS
// so it doesn't depend on ALL_RESOURCES having a matching entry, plus every
// image whose path falls under one of those tests' stim_folder) instead of
// preloading assets for all 14 tests every time.
function resourcesForTests(testIds) {
  const entries = new Map();
  SHARED_RESOURCE_NAMES.forEach((name) => entries.set(name, { name, path: name }));
  const folders = new Set();
  const customBareIds = [];
  testIds.forEach((id) => {
    if (typeof id === 'string' && id.indexOf('custom:') === 0) {
      customBareIds.push(id.slice('custom:'.length));
      return;
    }
    const def = TEST_DEFINITIONS[id];
    if (!def) return;
    entries.set(def.stim_file, { name: def.stim_file, path: def.stim_file });
    entries.set(def.instructions_file, { name: def.instructions_file, path: def.instructions_file });
    if (def.selector_box_image) {
      entries.set(def.selector_box_image, { name: def.selector_box_image, path: def.selector_box_image });
    }
    folders.add(def.stim_folder);
  });
  ALL_RESOURCES.forEach((r) => {
    for (const folder of folders) {
      if (r.name.indexOf(folder + '/') === 0) {
        entries.set(r.name, r);
        break;
      }
    }
  });
  if (customBareIds.length > 0) {
    // o_selector.png isn't in SHARED_RESOURCE_NAMES (only the built-in Flags
    // test pulls it in today) — a custom same-different test run without
    // Flags in the same battery still needs it preloaded explicitly here.
    entries.set(CUSTOM_INSTRUCTIONS_FILE, { name: CUSTOM_INSTRUCTIONS_FILE, path: CUSTOM_INSTRUCTIONS_FILE });
    customBareIds.forEach((bareId) => {
      const custom = customTestDefs[bareId];
      if (!custom) return;
      const selector = CUSTOM_SELECTOR_BY_TYPE[custom.type_of_test];
      if (selector) entries.set(selector, { name: selector, path: selector });
      (custom.items || []).forEach((it) => {
        if (it.standard_stim) entries.set(it.standard_stim, { name: it.standard_stim, path: it.standard_stim, download: true });
      });
    });
  }
  return Array.from(entries.values());
}

// Fetches the battery config (if a session id is present) before starting
// PsychoJS, so the resource preload list can be pruned to just the tests
// that are actually in the battery instead of always downloading all 270+
// files. Falls back to ALL_RESOURCES (today's behavior) whenever there's no
// session, the fetch fails, or the config is empty.
async function prepareAndStart() {
  var urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get('session');

  await supabaseScriptPromise;
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let resourcesToUse = ALL_RESOURCES;
  if (sessionId) {
    try {
      const { data, error } = await supabaseClient
        .from('batteries')
        .select('items, break_message, break_message_counter')
        .eq('id', sessionId)
        .single();
      if (error) {
        console.error('Failed to fetch battery config, using default test_list.csv:', error);
      } else if (data && Array.isArray(data.items) && data.items.length > 0) {
        const customBareIds = [...new Set(
          data.items
            .filter((i) => typeof i.testId === 'string' && i.testId.indexOf('custom:') === 0)
            .map((i) => i.testId.slice('custom:'.length))
        )];
        if (customBareIds.length > 0) {
          const { data: customRows, error: customErr } = await supabaseClient
            .from('custom_tests')
            .select('id, type_of_test, choices, items')
            .in('id', customBareIds);
          if (customErr) {
            console.error('Failed to fetch custom tests, they will be skipped:', customErr);
          } else {
            customRows.forEach((row) => { customTestDefs[row.id] = row; });
          }
        }
        testListRows = buildTestListRows(data.items);
        resourcesToUse = resourcesForTests(testListRows.map((row) => row.name_of_test));
        if (data.break_message) customBreakMessage = data.break_message;
        if (data.break_message_counter) customBreakMessageCounter = data.break_message_counter;
      }
    } catch (e) {
      console.error('Failed to fetch battery config, using default test_list.csv:', e);
    }
  }

  psychoJS.start({
    expName: expName,
    expInfo: expInfo,
    resources: resourcesToUse
  });
}

prepareAndStart();

psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.EXP);


var currentLoop;
var frameDur;
async function updateInfo() {
  currentLoop = psychoJS.experiment;  // right now there are no loops
  expInfo['date'] = util.MonotonicClock.getDateStr();  // add a simple timestamp
  expInfo['expName'] = expName;
  expInfo['psychopyVersion'] = '2024.2.4';
  expInfo['OS'] = window.navigator.platform;


  // store frame rate of monitor if we can measure it successfully
  expInfo['frameRate'] = psychoJS.window.getActualFrameRate();
  if (typeof expInfo['frameRate'] !== 'undefined')
    frameDur = 1.0 / Math.round(expInfo['frameRate']);
  else
    frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

  // add info from the URL:
  util.addInfoFromUrl(expInfo);


  
  psychoJS.experiment.dataFileName = (("." + "/") + `data/${expInfo["participant"]}_${expName}_${expInfo["date"]}`);
  psychoJS.experiment.field_separator = '\t';


  return Scheduler.Event.NEXT;
}


var initClock;
var screen_size;
var new_screen_height;
var scale;
var item_stim;
var custom_instructions_stim;
var isLastInstructionsPage;
var useCustomInstructions;
var selector_box;
var score_dict;
var coords;
var click_boxes;
var trialClock;
var testClock;
var previous_correct;
var previous_attempts;
var current_state;
var randomized_blocks;
var text_entry_box;
var intro_screenClock;
var intro_image;
var key_resp_4;
var set_varsClock;
var instructionsClock;
var key_resp_3;
var inst_feedback_text;
var text_box_corr;
var repeat_logicClock;
var itemClock;
var key_resp;
var mouse;
var key_inst_text;
var score_breakClock;
var blank_screen3;
var break_key_press;
var break_message;
var break_message_text;
var feedbackClock;
var blank_screen2;
var blank_screen;
var key_resp_2;
var feedback_text;
var endClock;
var globalClock;
var routineTimer;
var sessionId;
async function experimentInit() {
  // Initialize components for Routine "init"
  initClock = new util.Clock();
  // Run 'Begin Experiment' code from init_code
  
  //initialize screen size
  screen_size = psychoJS.window.size;
  
  let new_screen_width = screen_size[0];
  let new_screen_height = screen_size[1];
  
  if (((screen_size[1] / screen_size[0]) > (1080 / 1920))) {
      new_screen_height = (screen_size[0] * (1080 / 1920));
  } else {
      if (((screen_size[0] / screen_size[1]) > (1920 / 1080))) {
          new_screen_width = (screen_size[1] * (1920 / 1080));
      }
  }
  screen_size = [new_screen_width, new_screen_height];
  scale = (screen_size[0] / 1920);
  
  
  item_stim = new visual.ImageStim({                             
                                    win : psychoJS.window,
                                    name : 'item_stim', 
                                    units : 'pix', 
                                    image : 'selector.png', 
                                    mask : undefined,
                                    anchor : 'center',
                                    ori : 0.0, 
                                    pos : [0, 0], 
                                    size : [screen_size[0], screen_size[1]],
                                    color : new util.Color([1,1,1]), 
                                    opacity : 1,
                                    flipHoriz : false, flipVert : false,
                                    texRes : 128.0, 
                                    interpolate : true, 
                                    depth : 0.0 
    });
  
  item_stim.setAutoDraw(true);

  // Renders a test's custom-instructions text (researcher override for the
  // final instructions page) instead of the default instructions image.
  // Hidden until instructionsRoutineBegin turns it on for that one page.
  custom_instructions_stim = new visual.TextStim({
                                    win: psychoJS.window,
                                    name: 'custom_instructions_stim',
                                    text: '',
                                    font: 'Arial',
                                    units: 'pix',
                                    pos: [0, 0],
                                    height: 32 * scale,
                                    wrapWidth: 1400 * scale,
                                    ori: 0.0,
                                    color: new util.Color('black'),
                                    opacity: 1,
                                    depth: -1.0
    });
  custom_instructions_stim.setAutoDraw(false);

  selector_box = new visual.ImageStim({
                                  win: psychoJS.window,
                                  name: "selector_box",
                                  image: "selector.png",
                                  size: [200 * scale,50 * scale],
                                  pos: [-2000 * scale, 0],
                                  ori: 0.0,
                                  units: 'pix',        // Specify units
                                  opacity: 1.0,       // Fully opaque
                                  depth: -100,           // Default depth  
                                  autoDraw: true,       // Draw automatically
                                  });    
  
  score_dict = {};
  coords = [];
  click_boxes = {};
  
  trialClock = new util.Clock();  // Initialize the clock
  testClock = new util.Clock();
  
  previous_correct = 0;
  previous_attempts = 0;
  current_state = 'advance';
  click_boxes = {};
  
  
  
  //read url variable (participant)
  util.addInfoFromUrl(expInfo);
  
  randomized_blocks = false;
  
  
  
  text_entry_box = new visual.TextBox({
    win: psychoJS.window,
    name: 'text_entry_box',
    text: '',
    placeholder: 'Type here...',
    font: 'Arial',
    pos: [(- 2000), 0], 
    draggable: false,
    letterHeight: 30.0,
    lineSpacing: 1.0,
    size: [200, 50],  units: undefined, 
    ori: 0.0,
    color: [(- 1.0), (- 1.0), (- 1.0)], colorSpace: 'rgb',
    fillColor: [1.0, 1.0, 1.0], borderColor: [(- 1.0), (- 1.0), (- 1.0)],
    languageStyle: 'LTR',
    bold: false, italic: false,
    opacity: undefined,
    padding: 0.0,
    alignment: 'center',
    overflow: 'visible',
    editable: false,
    multiline: true,
    anchor: 'center',
    depth: -1.0 
  });
  
  // Initialize components for Routine "intro_screen"
  intro_screenClock = new util.Clock();
  intro_image = new visual.ImageStim({
    win : psychoJS.window,
    name : 'intro_image', units : undefined, 
    image : 'intro.png', mask : undefined,
    anchor : 'center',
    ori : 0.0, 
    pos : [0, 0], 
    draggable: false,
    size : [1920, 1080],
    color : new util.Color([1,1,1]), opacity : undefined,
    flipHoriz : false, flipVert : false,
    texRes : 128.0, interpolate : true, depth : 0.0 
  });
  key_resp_4 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  // Initialize components for Routine "set_vars"
  set_varsClock = new util.Clock();
  // Initialize components for Routine "instructions"
  instructionsClock = new util.Clock();
  key_resp_3 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  inst_feedback_text = new visual.TextStim({
    win: psychoJS.window,
    name: 'inst_feedback_text',
    text: '',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 40.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('black'),  opacity: undefined,
    depth: -2.0 
  });
  
  text_box_corr = new visual.TextStim({
    win: psychoJS.window,
    name: 'text_box_corr',
    text: '',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 40.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color([(- 1.0), 0.7647, (- 1.0)]),  opacity: undefined,
    depth: -3.0 
  });
  
  // Initialize components for Routine "repeat_logic"
  repeat_logicClock = new util.Clock();
  // Initialize components for Routine "item"
  itemClock = new util.Clock();
  key_resp = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  mouse = new core.Mouse({
    win: psychoJS.window,
  });
  mouse.mouseClock = new util.Clock();
  key_inst_text = new visual.TextStim({
    win: psychoJS.window,
    name: 'key_inst_text',
    text: 'Press Enter to submit your answer.',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 30.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color([0.5608, 0.6, 0.5922]),  opacity: undefined,
    depth: -3.0 
  });
  
  // Initialize components for Routine "score_break"
  score_breakClock = new util.Clock();
  blank_screen3 = new visual.ImageStim({
    win : psychoJS.window,
    name : 'blank_screen3', units : undefined, 
    image : 'break_image.png', mask : undefined,
    anchor : 'center',
    ori : 0.0, 
    pos : [0, 0], 
    draggable: false,
    size : [1920, 1080],
    color : new util.Color([1,1,1]), opacity : undefined,
    flipHoriz : false, flipVert : false,
    texRes : 128.0, interpolate : true, depth : 0.0 
  });
  break_key_press = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  break_message = new visual.TextStim({
    win: psychoJS.window,
    name: 'break_message',
    text: '',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 35.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('black'),  opacity: undefined,
    depth: -3.0 
  });
  
  break_message_text = new visual.TextStim({
    win: psychoJS.window,
    name: 'break_message_text',
    text: '',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 35.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('black'),  opacity: undefined,
    depth: -4.0 
  });
  
  // Initialize components for Routine "feedback"
  feedbackClock = new util.Clock();
  blank_screen2 = new visual.ImageStim({
    win : psychoJS.window,
    name : 'blank_screen2', units : undefined, 
    image : 'break_image.png', mask : undefined,
    anchor : 'center',
    ori : 0.0, 
    pos : [0, 0], 
    draggable: false,
    size : [0.5, 0.5],
    color : new util.Color([1,1,1]), opacity : undefined,
    flipHoriz : false, flipVert : false,
    texRes : 128.0, interpolate : true, depth : 0.0 
  });
  blank_screen = new visual.Rect ({
    win: psychoJS.window, name: 'blank_screen', 
    width: [2000, 2000][0], height: [2000, 2000][1],
    ori: 0.0, 
    pos: [0, 0], 
    draggable: false, 
    anchor: 'center', 
    lineWidth: 1.0, 
    lineColor: new util.Color('white'), 
    fillColor: new util.Color('white'), 
    colorSpace: 'rgb', 
    opacity: undefined, 
    depth: -1, 
    interpolate: true, 
  });
  
  key_resp_2 = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  feedback_text = new visual.TextStim({
    win: psychoJS.window,
    name: 'feedback_text',
    text: '',
    font: 'Open Sans',
    units: undefined, 
    pos: [0, 0], draggable: false, height: 40.0,  wrapWidth: undefined, ori: 0.0,
    languageStyle: 'LTR',
    color: new util.Color('black'),  opacity: undefined,
    depth: -4.0 
  });
  
  // Initialize components for Routine "end"
  endClock = new util.Clock();
  psychoJS._saveResults = 0;  // stop it from trying to POST to Pavlovia
  // sessionId / supabaseClient / testListRows are already set by
  // prepareAndStart() before this routine runs.
  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine
  
  return Scheduler.Event.NEXT;
}


var init_loop;
function init_loopLoopBegin(init_loopLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    init_loop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: testListRows,
      seed: undefined, name: 'init_loop'
    });
    psychoJS.experiment.addLoop(init_loop); // add the loop to the experiment
    currentLoop = init_loop;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    init_loop.forEach(function() {
      snapshot = init_loop.getSnapshot();
    
      init_loopLoopScheduler.add(importConditions(snapshot));
      init_loopLoopScheduler.add(initRoutineBegin(snapshot));
      init_loopLoopScheduler.add(initRoutineEachFrame());
      init_loopLoopScheduler.add(initRoutineEnd(snapshot));
      init_loopLoopScheduler.add(init_loopLoopEndIteration(init_loopLoopScheduler, snapshot));
    });
    
    return Scheduler.Event.NEXT;
  }
}


async function init_loopLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(init_loop);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function init_loopLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var test_loop;
function test_loopLoopBegin(test_loopLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    test_loop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: testListRows,
      seed: undefined, name: 'test_loop'
    });
    psychoJS.experiment.addLoop(test_loop); // add the loop to the experiment
    currentLoop = test_loop;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    test_loop.forEach(function() {
      snapshot = test_loop.getSnapshot();
    
      test_loopLoopScheduler.add(importConditions(snapshot));
      test_loopLoopScheduler.add(set_varsRoutineBegin(snapshot));
      test_loopLoopScheduler.add(set_varsRoutineEachFrame());
      test_loopLoopScheduler.add(set_varsRoutineEnd(snapshot));
      const repeat_instLoopScheduler = new Scheduler(psychoJS);
      test_loopLoopScheduler.add(repeat_instLoopBegin(repeat_instLoopScheduler, snapshot));
      test_loopLoopScheduler.add(repeat_instLoopScheduler);
      test_loopLoopScheduler.add(repeat_instLoopEnd);
      const item_loopLoopScheduler = new Scheduler(psychoJS);
      test_loopLoopScheduler.add(item_loopLoopBegin(item_loopLoopScheduler, snapshot));
      test_loopLoopScheduler.add(item_loopLoopScheduler);
      test_loopLoopScheduler.add(item_loopLoopEnd);
      test_loopLoopScheduler.add(score_breakRoutineBegin(snapshot));
      test_loopLoopScheduler.add(score_breakRoutineEachFrame());
      test_loopLoopScheduler.add(score_breakRoutineEnd(snapshot));
      test_loopLoopScheduler.add(test_loopLoopEndIteration(test_loopLoopScheduler, snapshot));
    });
    
    return Scheduler.Event.NEXT;
  }
}


var repeat_inst;
function repeat_instLoopBegin(repeat_instLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    repeat_inst = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 2, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: undefined,
      seed: undefined, name: 'repeat_inst'
    });
    psychoJS.experiment.addLoop(repeat_inst); // add the loop to the experiment
    currentLoop = repeat_inst;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    repeat_inst.forEach(function() {
      snapshot = repeat_inst.getSnapshot();
    
      repeat_instLoopScheduler.add(importConditions(snapshot));
      const instructions_loopLoopScheduler = new Scheduler(psychoJS);
      repeat_instLoopScheduler.add(instructions_loopLoopBegin(instructions_loopLoopScheduler, snapshot));
      repeat_instLoopScheduler.add(instructions_loopLoopScheduler);
      repeat_instLoopScheduler.add(instructions_loopLoopEnd);
      repeat_instLoopScheduler.add(repeat_logicRoutineBegin(snapshot));
      repeat_instLoopScheduler.add(repeat_logicRoutineEachFrame());
      repeat_instLoopScheduler.add(repeat_logicRoutineEnd(snapshot));
      repeat_instLoopScheduler.add(repeat_instLoopEndIteration(repeat_instLoopScheduler, snapshot));
    });
    
    return Scheduler.Event.NEXT;
  }
}


var instructions_loop;
function instructions_loopLoopBegin(instructions_loopLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    instructions_loop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: instructions_file,
      seed: undefined, name: 'instructions_loop'
    });
    psychoJS.experiment.addLoop(instructions_loop); // add the loop to the experiment
    currentLoop = instructions_loop;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    instructions_loop.forEach(function() {
      snapshot = instructions_loop.getSnapshot();
    
      instructions_loopLoopScheduler.add(importConditions(snapshot));
      instructions_loopLoopScheduler.add(instructionsRoutineBegin(snapshot));
      instructions_loopLoopScheduler.add(instructionsRoutineEachFrame());
      instructions_loopLoopScheduler.add(instructionsRoutineEnd(snapshot));
      instructions_loopLoopScheduler.add(instructions_loopLoopEndIteration(instructions_loopLoopScheduler, snapshot));
    });
    
    return Scheduler.Event.NEXT;
  }
}


async function instructions_loopLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(instructions_loop);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function instructions_loopLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


async function repeat_instLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(repeat_inst);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function repeat_instLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var item_loop;
function item_loopLoopBegin(item_loopLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    // Resolve the full item list up front so battery-config item selection
    // (selectedItems/itemCount) can trim it before the TrialHandler is built —
    // that way nTotal/nStim reflect the trimmed count from the start, rather
    // than needing to be recomputed after the fact.
    function shuffleItems(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    // Custom tests carry their own item rows in-memory (attached to the test
    // row by buildTestListRows) instead of a CSV to import — TrialHandler
    // already accepts a plain array here, the same way test_loop/init_loop
    // are constructed from in-memory arrays rather than files.
    let itemTrialList = test_loop.thisTrial['name_of_test'].indexOf('custom:') === 0
      ? test_loop.thisTrial['custom_items'].slice()
      : TrialHandler.importConditions(psychoJS.serverManager, stim_file);
    const configSelectedItems = test_loop.thisTrial['selectedItems'];
    const configItemCount = test_loop.thisTrial['itemCount'];
    if (Array.isArray(configSelectedItems) && configSelectedItems.length > 0) {
      const selectedSet = new Set(configSelectedItems);
      itemTrialList = itemTrialList.filter((row) => selectedSet.has(row['standard_stim']));
    } else if (typeof configItemCount === 'number' && configItemCount > 0 && configItemCount < itemTrialList.length) {
      if (test_loop.thisTrial['randomize'] == 1) {
        shuffleItems(itemTrialList);
      }
      itemTrialList = itemTrialList.slice(0, configItemCount);
    }
    item_loop = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 1, method: TrialHandler.Method.SEQUENTIAL,
      extraInfo: expInfo, originPath: undefined,
      trialList: itemTrialList,
      seed: undefined, name: 'item_loop'
    });
    psychoJS.experiment.addLoop(item_loop); // add the loop to the experiment
    currentLoop = item_loop;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    item_loop.forEach(function() {
      snapshot = item_loop.getSnapshot();
    
      item_loopLoopScheduler.add(importConditions(snapshot));
      item_loopLoopScheduler.add(itemRoutineBegin(snapshot));
      item_loopLoopScheduler.add(itemRoutineEachFrame());
      item_loopLoopScheduler.add(itemRoutineEnd(snapshot));
      item_loopLoopScheduler.add(item_loopLoopEndIteration(item_loopLoopScheduler, snapshot));
    });
    
    return Scheduler.Event.NEXT;
  }
}


async function item_loopLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(item_loop);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function item_loopLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


async function test_loopLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(test_loop);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function test_loopLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var t;
var frameN;
var continueRoutine;
var initMaxDurationReached;
var initMaxDuration;
var initComponents;
function initRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'init' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    initClock.reset();
    routineTimer.reset();
    initMaxDurationReached = false;
    // update component parameters for each repeat
    //redirect_url = init_loop.thisTrial['redirect_url'];
    //psychoJS.setRedirectUrls((redirect_url), '');
    
    
    initMaxDuration = null
    // keep track of which components have finished
    initComponents = [];
    initComponents.push(text_entry_box);
    
    initComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


var frameRemains;
function initRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'init' ---
    // get current time
    t = initClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *text_entry_box* updates
    if (t >= 0 && text_entry_box.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text_entry_box.tStart = t;  // (not accounting for frame time here)
      text_entry_box.frameNStart = frameN;  // exact frame index
      
      text_entry_box.setAutoDraw(true);
    }
    
    frameRemains = 0 + 0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (text_entry_box.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      text_entry_box.setAutoDraw(false);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    initComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function initRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'init' ---
    initComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    // the Routine "init" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var intro_screenMaxDurationReached;
var _key_resp_4_allKeys;
var intro_screenMaxDuration;
var intro_screenComponents;
function intro_screenRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'intro_screen' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    intro_screenClock.reset();
    routineTimer.reset();
    intro_screenMaxDurationReached = false;
    // update component parameters for each repeat
    intro_image.size = [1920 * scale, 1080 * scale];
    intro_image.setAutoDraw(false);
    intro_image.setAutoDraw(true);
    
    key_resp_4.keys = undefined;
    key_resp_4.rt = undefined;
    _key_resp_4_allKeys = [];
    psychoJS.experiment.addData('intro_screen.started', globalClock.getTime());
    intro_screenMaxDuration = null
    // keep track of which components have finished
    intro_screenComponents = [];
    intro_screenComponents.push(intro_image);
    intro_screenComponents.push(key_resp_4);
    
    intro_screenComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function intro_screenRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'intro_screen' ---
    // get current time
    t = intro_screenClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *intro_image* updates
    if (t >= 0.0 && intro_image.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      intro_image.tStart = t;  // (not accounting for frame time here)
      intro_image.frameNStart = frameN;  // exact frame index
      
      intro_image.setAutoDraw(true);
    }
    
    
    // *key_resp_4* updates
    if (t >= 0.0 && key_resp_4.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp_4.tStart = t;  // (not accounting for frame time here)
      key_resp_4.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp_4.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp_4.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp_4.clearEvents(); });
    }
    
    if (key_resp_4.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp_4.getKeys({keyList: ['return'], waitRelease: false});
      _key_resp_4_allKeys = _key_resp_4_allKeys.concat(theseKeys);
      if (_key_resp_4_allKeys.length > 0) {
        key_resp_4.keys = _key_resp_4_allKeys[_key_resp_4_allKeys.length - 1].name;  // just the last key pressed
        key_resp_4.rt = _key_resp_4_allKeys[_key_resp_4_allKeys.length - 1].rt;
        key_resp_4.duration = _key_resp_4_allKeys[_key_resp_4_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    intro_screenComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function intro_screenRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'intro_screen' ---
    intro_screenComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('intro_screen.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(key_resp_4.corr, level);
    }
    psychoJS.experiment.addData('key_resp_4.keys', key_resp_4.keys);
    if (typeof key_resp_4.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('key_resp_4.rt', key_resp_4.rt);
        psychoJS.experiment.addData('key_resp_4.duration', key_resp_4.duration);
        routineTimer.reset();
        }
    
    key_resp_4.stop();
    // the Routine "intro_screen" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var set_varsMaxDurationReached;
var test_order_list;
var choices;
var name_of_test;
var stim_folder;
var stim_file;
var type_of_test;
var instructions_pages;
var instructions_file;
var practice_items;
var items;
var time_min;
var time_max;
var shuffled_trials;
var test_score;
var score_dict_set;
var previously_selected;
var prev_att_correct;
var prev_text_box_answer;
var retry_count;
var practice_retry;
var set_varsMaxDuration;
var set_varsComponents;
function set_varsRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'set_vars' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    set_varsClock.reset();
    routineTimer.reset();
    set_varsMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from set_vars_code1
    //randomize tests if randomize is set
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
       }
        return array;
    }
    
    if (randomized_blocks == false){
        let test_random_list = [];
        let test_order_list = [];
        //let first_test;
        //let last_test;
        let test_index_list = [];
        for (let test of test_loop.trialList){
            //if (test['test_order'] == 'F'){
            //    first_test = test;
            if (test['test_order'] == 'R'){
                test_random_list.push(test);
            //} else if (test['test_order'] == 'L'){
            //    last_test = test;
            } else {
                test_index_list.push([test, test['test_order']]);
            }
        }
        //arrange tests in the specified order, randomizing R tests
        //if (first_test){
        //    test_order_list.push(first_test);
        //}
    
        shuffle(test_random_list);
        //if (test_order_list.length > 0) {
        //    test_order_list = test_order_list.concat(test_random_list);
        //} else {
        test_order_list = test_random_list;
    
        // Sort test_index_list by the second value (index)
        test_index_list.sort(function(a, b) {
            return a[1] - b[1];  // Compare the indices (second element in each pair)
        });
        
        //put tests with specific slots into those slots
        for (let test_order_pair of test_index_list){    
            test_order_list.splice(test_order_pair[1], 0, test_order_pair[0]);
        }
    
        //if (last_test){
        //    test_order_list.push(last_test);
        //}
        //console.log(test_order_list);
        
    
    
        //set test loop trial list to new order
        // Overwrite each item in place to update the loop's internal trial order
        for (let i = 0; i < test_loop.trialList.length; i++) {
            test_loop.trialList[i] = test_order_list[i];
        }
        randomized_blocks = true;
        
        //force thisTrial to update
        test_loop.thisTrial = test_loop.trialList[0];
    
    }
    
    
    
    choices = test_loop.thisTrial["choices"];
    name_of_test = test_loop.thisTrial["name_of_test"];
    
    stim_folder = test_loop.thisTrial["stim_folder"];
    stim_file = test_loop.thisTrial["stim_file"];
    
    type_of_test = test_loop.thisTrial["type_of_test"];
    instructions_pages = test_loop.thisTrial["instructions_pages"];
    instructions_file = test_loop.thisTrial["instructions_file"];
    practice_items = test_loop.thisTrial["practice_items"];
    items = test_loop.thisTrial["items"];
    time_min = test_loop.thisTrial["time_min"];
    time_max = test_loop.thisTrial["time_max"];
    shuffled_trials = false;
    
    test_score = 0;
    score_dict[name_of_test] = {"score": null, "possible": null, "prev_scores": test_loop.thisTrial["prev_scores"]};
    score_dict_set = false;
    
    previous_attempts = 0;
    previously_selected = [];
    current_state = 'advance';
    
    if ((type_of_test === "multiple selections")) {
        click_boxes = {};
        for (var i, _pj_c = 0, _pj_a = util.range(choices), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            i = _pj_a[_pj_c];
            click_boxes[("click_box" + i.toString())] = new visual.Rect({
                                                                         win: psychoJS.window,                                                                     name: "Rclick_box" + i.toString(),
                                                                         //edges: 4,
                                                                         size: [200 * scale, 200 * scale],
                                                                         pos: [0, 0],
                                                                         lineColor: new util.Color([-1,-1,-1]),
                                                                         fillColor: new util.Color([1,1,1]),
                                                                         lineWidth: 5 * scale,
                                                                         units: 'pix',        // Specify units
                                                                         opacity: 1.0,       // Fully opaque
                                                                         depth: -100,           // Default depth
                                                                         autoDraw: true,       // Draw automatically
                                                                         colorSpace: "rgb"
                                                                         });

        }
    } else if (type_of_test == 'multiple choice') {
            selector_box.setImage(test_loop.thisTrial['selector_box_image']);
            prev_ans_index = 0;
    }
    
    
    prev_att_correct = false;
    
    prev_text_box_answer = '';
    
    retry_count = 0;
    practice_retry = false;
    
    
    
    
    set_varsMaxDuration = null
    // keep track of which components have finished
    set_varsComponents = [];
    
    set_varsComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function set_varsRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'set_vars' ---
    // get current time
    t = set_varsClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    set_varsComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function set_varsRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'set_vars' ---
    set_varsComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    // the Routine "set_vars" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var instructionsMaxDurationReached;
var Pcoords;
var Pans_boxes;
var Pletters;
var currently_selected;
var Pclicked_stim;
var answerPositionPX;
var answerPostiionPY;
var sel_size;
var selector_images;
var Pms_corr;
var Pms_incorr;
var Pms_points;
var s_or_o;
var Pcurrently_selected;
var SDcurrently_selected;
var choice_number;
var retry;
var inst_page_string;
var already_set_up;
var answerPositionPY;
var selector_size;
var sel_pos;
var mouse_down;
var _key_resp_3_allKeys;
var instructionsMaxDuration;
var instructionsComponents;
function instructionsRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'instructions' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    instructionsClock.reset();
    routineTimer.reset();
    instructionsMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from instructions_code1
    let already_set_up = false;
    
    Pcoords = [];
    Pans_boxes = {};
    Pletters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    currently_selected = [];
    Pclicked_stim = null;
    answerPositionPX = [];
    answerPostiionPY = [];
    sel_size = 0;
    selector_images = [];
    Pms_corr = 0;
    Pms_incorr = 0;
    Pms_points = 0;
    s_or_o = 'S';
    Pcurrently_selected = [];
    SDcurrently_selected = [];
    choice_number = 0;
    retry = instructions_loop.thisTrial['retry'];
    
    
    inst_page_string = instructions_loop.thisTrial["instructions_page"];
    // Custom instructions only ever replace the FINAL page of a test's
    // instructions loop (the plain "here are the rules, press enter" page) —
    // every earlier page is a practice item / feedback / retry step tied to
    // fixed click-target coordinates on its specific image, so those always
    // stay as the default image regardless of this setting.
    isLastInstructionsPage = (instructions_loop.thisN === (instructions_loop.trialList.length - 1));
    useCustomInstructions = isLastInstructionsPage && test_loop.thisTrial['custom_instructions'] == 1 && test_loop.thisTrial['custom_instructions_text'];
    if (useCustomInstructions) {
        item_stim.setPos([-4000 * scale, 0]);
        custom_instructions_stim.text = renderCustomInstructionsText(test_loop.thisTrial['custom_instructions_text']);
        custom_instructions_stim.setPos([0, 0]);
        custom_instructions_stim.setAutoDraw(true);
    } else {
        item_stim.setImage((stim_folder + "/") + inst_page_string);
        item_stim.setPos([0, 0]);
        custom_instructions_stim.setAutoDraw(false);
    }
    item_stim.size = [1920 * scale, 1080 * scale];
    
    //move selector box and text entry box off screen until needed
    selector_box.setPos([-2000 * scale, 0]);
    selector_box.setAutoDraw(false);
    selector_box.setAutoDraw(true);
    text_entry_box.setPos([-2000 * scale, 0]);
    text_entry_box.text = '';
    text_entry_box.setAutoDraw(false);
    text_entry_box.setAutoDraw(true);
    //clear feedback text box
    text_box_corr.text = '';
    text_box_corr.setAutoDraw(false);
    text_box_corr.setAutoDraw(true);
    
    ///////////////////////////////////
    // feedback and att check
    
    if (instructions_loop.thisTrial["feedback"]){
        inst_feedback_text.setPos([0, 500 * scale]);
        inst_feedback_text.wrapWidth = 1800 * scale;
        inst_feedback_text.height = 35 * scale;
        inst_feedback_text.setAutoDraw(false);
        inst_feedback_text.setAutoDraw(true);
        
        //show their submitted answer by moving the selector box
        if ((type_of_test === "multiple choice")) {
            already_set_up = true;
            
            answerPositionPX = instructions_loop.thisTrial["answer_positionPX"];
            answerPositionPY = instructions_loop.thisTrial["answer_positionPY"];
            
            for (var i, _pj_c = 0, _pj_a = util.range(answerPositionPX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                i = _pj_a[_pj_c];
                let l = Pletters[i];
                Pcoords = [Number(answerPositionPX[i]) * scale, Number(answerPositionPY[i] * scale)];
                Pcoords = [((-1 * screen_size[0]/2) + Pcoords[0]), (screen_size[1]/2 - Pcoords[1])];
                Pans_boxes['Pans_box_' + l] = Pcoords;
            }
        
            selector_size = [Number(instructions_loop.thisTrial["selector_sizeP"][0]) * scale, Number(instructions_loop.thisTrial["selector_sizeP"][1]) * scale];
            selector_box.setSize(selector_size);
            
            if (prev_ans_index !== undefined && prev_ans_index !== "None" && prev_ans_index > -1){
                sel_pos = Object.values(Pans_boxes)[prev_ans_index];
                selector_box.setPos([(sel_pos[0] + (selector_box.size[0] / 2)), (sel_pos[1] - (selector_box.size[1] / 2))]);
                selector_box.setAutoDraw(true);
            } else {
                selector_box.setPos(-2000 * scale, 0);
                selector_box.setAutoDraw(false);
            }
            
        } else if (type_of_test == 'fill in the blank'){
            //show previous answer, unless it's a retry
            if (retry !== 1 || previous_correct == 1){
                text_box_corr.text = instructions_loop.thisTrial['correct_answerP'];
            } else {
                text_box_corr.text = '';
            }
            
            //move to a function 'updateTextBox'??
            //get size and x,y coordinates
            let text_box_size = ([Number(instructions_loop.thisTrial["textbox_size"][0]) * scale, Number(instructions_loop.thisTrial["textbox_size"][1]) * scale]);
            let Tcoords = [Number(instructions_loop.thisTrial["textbox_position"][0]) * scale, Number(instructions_loop.thisTrial["textbox_position"][1]) * scale];
            //translate to psychojs coords, adjust for the size of box
            let text_coords = [((-1 * screen_size[0]/2) + Tcoords[0]) + text_box_size[0]/2, (screen_size[1]/2 - Tcoords[1]) - text_box_size[1]/2];
            text_entry_box.setPos(text_coords);
            text_entry_box.setSize(text_box_size);
            text_entry_box.editable = false;
            text_entry_box.setAutoDraw(false);
            text_entry_box.setAutoDraw(true);
            text_entry_box.text = prev_text_box_answer;
            text_box_corr.setPos([text_coords[0] + text_box_size[0] + 50 * scale, text_coords[1]]);
            text_box_corr.setAutoDraw(false);
            text_box_corr.setAutoDraw(true);
        } else if (type_of_test == 'multiple selections'){
                for (let click_box of Object.values(click_boxes)){
                    //make it green if it is correct unless it's a retry
                    if (instructions_loop.thisTrial['correct_answerP'].includes(click_box.name) && (retry !== 1 || previous_correct == 1)){
                        click_box.setFillColor([0,1,0]);
                    }
                    click_box.setAutoDraw(true);
    
                    for (let selection of previously_selected){
                        if (click_box == selection){
                           let selector_image = new visual.ImageStim({
                                win: psychoJS.window,
                                image: test_loop.thisTrial['selector_box_image'],  
                                pos: click_box.pos,
                                size: [click_box.size[0]/2, click_box.size[1]/2],
                                depth: -100
                                });
                            selector_image.setAutoDraw(true);  // Show the feedback
                            selector_images.push(selector_image);  // Add to tracking array
                        }
                    }
                }    
        } else if (type_of_test == 'same different'){
              already_set_up = true;
              
              answerPositionPX = instructions_loop.thisTrial["answer_positionPX"];
              answerPositionPY = instructions_loop.thisTrial["answer_positionPY"];
    
              let choice_adjust = 0; //subtract an increasing integer to get the 'S' ans choice numbers
              let choice_n = 1; //use a counter starting from 1 to name the answer choices
              
              //loop through a range from 1 to length of answer choices
              for (var x, _pj_c = 0, _pj_a = util.range(answerPositionPX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                  x = _pj_a[_pj_c];
                  Pcoords = [Number(answerPositionPX[x]) * scale, Number(answerPositionPY[x] * scale)];
                  Pcoords = [((-1 * screen_size[0]/2) + Pcoords[0]), (screen_size[1]/2 - Pcoords[1])];
                  //set the same or opposite ans boxes
                  if (choice_n % 2 !== 0){
                      s_or_o = 'S';
                      choice_number = choice_n - choice_adjust;
                  } else {
                      s_or_o = 'O';
                      choice_number = choice_n/2;
                  }
                  //add the coordinates to the Pans_boxes dictionary with item number and S or O as the key
                  Pans_boxes['Pans_box_' + choice_number.toString() + s_or_o] = Pcoords;
                  choice_n = choice_n + 1;
                  choice_adjust = choice_adjust + .5;
              }
              //check for prev answers
              if (prev_SD_answers.length > 0){
                  SDcurrently_selected = prev_SD_answers;
                  prev_SD_answers = [];
                  for (let ans_box of SDcurrently_selected){
                      //check which ans choices were selected and draw selector box
                      let sel_size = instructions_loop.thisTrial['selector_sizeP'];
                      sel_size = [Number(sel_size[0]) * scale, Number(sel_size[1]) * scale]
                      let selector_image = new visual.ImageStim({
                          win: psychoJS.window,
                          image: test_loop.thisTrial['selector_box_image'],  
                          pos: [Pans_boxes[ans_box][0] + sel_size[0]/2, Pans_boxes[ans_box][1] - sel_size[1]/2],
                          size: sel_size,
                          depth: -100,
                          name: 'sel' + ans_box
                      });
                      selector_image.setAutoDraw(true);  // Show the selector image
                      selector_images.push(selector_image);  // Add to tracking array
                  } 
              }
        }
        
        //if this is feedback, if the att check was correct, and this is att check
        if (prev_att_correct){
            if (instructions_loop.thisTrial["att_check"]){
                previous_attempts = 0;
                current_state = 'advance';
                //reset this for multiple att checks
                prev_att_correct = false;
            }  
        }
    
        if (previous_correct == 1){
            inst_feedback_text.text = "You were correct!";
            if (retry > 0){ //if this is a retry problem, skip to green highlight
                item_stim.setImage((stim_folder + "/") + inst_page_string.replace('.png', '2.png'));
                item_stim.size = [1920 * scale, 1080 * scale];
                practice_retry = false;
            }
            //set prev correct back to 0 for multiple practice items
            //previous_correct = 0;
        //practice item wrong and retry
        } else if (retry > 0){
            if (retry_count < retry){
                //repeat practice trial
                console.log('repeat the trial');
                inst_feedback_text.text = "You were incorrect. Try again.";
                retry_count++;
                practice_retry = true;
            } else {
                //skip to feedback with green box image
                inst_feedback_text.text = "You were incorrect. The correct answer is highlighted in green.";
                item_stim.setImage((stim_folder + "/") + inst_page_string.replace('.csv', '2.csv'));
                item_stim.size = [1920 * scale, 1080 * scale];
                practice_retry = false;
            }
        //if practice item wrong and att check
        } else if (instructions_loop.thisTrial["att_check"] == 0){    
            inst_feedback_text.text = "You were incorrect. The correct answer is highlighted in green.";
        } else if (previous_attempts == 0){
            inst_feedback_text.text = "You were incorrect. The correct answer is highlighted in green. Please reread the instructions and try again. Make sure you select the correct answer this time or you will not be able to participate in this study.";
            current_state = 'repeat';
            instructions_loop.finished = true;     
        } else {
            inst_feedback_text.text = "You were incorrect. Unfortunately you will not be able to participate in this study."
            current_state = 'quit';
            instructions_loop.finished = true;
        }
    
    
    
    console.log('retry');
    console.log(retry);
    
    //else not feedback
    } else {
        inst_feedback_text.text = '';
    }
    
    console.log('practice retry');
    console.log(practice_retry);
    if (practice_retry == false){
        if (retry == -1){
            console.log('cont rout false');
            //skip the practice retry
            continueRoutine = false;
        }
    }
    
    /////////////////////////////
    // practice item
    
    previous_correct = 0;
    
    
    if (instructions_loop.thisTrial["practice_item"]) {
        if ((type_of_test === "multiple choice")) {
            if (already_set_up == false){
                answerPositionPX = instructions_loop.thisTrial["answer_positionPX"];
                answerPositionPY = instructions_loop.thisTrial["answer_positionPY"];
    
                for (var i, _pj_c = 0, _pj_a = util.range(answerPositionPX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    let i = _pj_a[_pj_c];
                    let l = Pletters[i];
                    Pcoords = [Number(answerPositionPX[i]) * scale, Number(answerPositionPY[i]) * scale];
                    Pcoords = [((-1 * screen_size[0]/2) + Pcoords[0]), (screen_size[1]/2 - Pcoords[1])];
    
                    Pans_boxes['Pans_box_' + l] = Pcoords;
                }
            
                selector_box.setPos([-2000 * scale, 0]);
                selector_size = [Number(instructions_loop.thisTrial["selector_sizeP"][0]) * scale, Number(instructions_loop.thisTrial["selector_sizeP"][1]) * scale];
                selector_box.setSize(selector_size);
                selector_box.setAutoDraw(false);
                
            }
        } else if ((type_of_test === "fill in the blank")) {
            //get size and x,y coordinates
            let text_box_size = ([Number(instructions_loop.thisTrial["textbox_size"][0]) * scale, Number(instructions_loop.thisTrial["textbox_size"][1]) * scale]);
            let Tcoords = [Number(instructions_loop.thisTrial["textbox_position"][0]) * scale, Number(instructions_loop.thisTrial["textbox_position"][1]) * scale];
            //translate to psychojs coords, adjust for the size of box
            let text_coords = [((-1 * screen_size[0]/2) + Tcoords[0]) + text_box_size[0]/2, (screen_size[1]/2 - Tcoords[1]) - text_box_size[1]/2];
            text_entry_box.setPos(text_coords);
            text_entry_box.setSize(text_box_size);
            text_entry_box.editable = true;
            text_entry_box.setAutoDraw(false);
            text_entry_box.setAutoDraw(true);
                
        } else if ((type_of_test === "multiple selections")) {
    
            answerPositionPX = instructions_loop.thisTrial['answer_positionPX'];
            answerPositionPY = instructions_loop.thisTrial['answer_positionPY'];
            
            for (var i, _pj_c = 0, _pj_a = util.range(answerPositionPX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                i = _pj_a[_pj_c];
                sel_size = [Number(instructions_loop.thisTrial["selector_sizeP"][0]) * scale, Number(instructions_loop.thisTrial["selector_sizeP"][1]) * scale];
                let Pcoords = [Number(answerPositionPX[i]) * scale, Number(answerPositionPY[i]) * scale];
                Pcoords = [((-1 * screen_size[0]/2) + Pcoords[0] + sel_size[0]/2), ((screen_size[1]/2) - Pcoords[1] - sel_size[1]/2)];
                click_boxes["click_box" + i.toString()].setPos(Pcoords);
                click_boxes["click_box" + i.toString()].setSize([sel_size[0] * 2, sel_size[1] * 2]);
                click_boxes["click_box" + i.toString()].setFillColor(new util.Color([1,1,1]));
                click_boxes["click_box" + i.toString()].setAutoDraw(false);
                click_boxes["click_box" + i.toString()].setAutoDraw(true);
            }

            currently_selected = [];
        } else if (type_of_test == 'same different'){
            if (already_set_up == false){
                answerPositionPX = instructions_loop.thisTrial["answer_positionPX"];
                answerPositionPY = instructions_loop.thisTrial["answer_positionPY"];
    
                let choice_adjust = 0; //subtract an increasing integer to get the 'S' ans choice numbers
                let choice_n = 1;
              
                for (var x, _pj_c = 0, _pj_a = util.range(answerPositionPX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    x = _pj_a[_pj_c];
                    Pcoords = [Number(answerPositionPX[x]) * scale, Number(answerPositionPY[x] * scale)];
                    Pcoords = [((-1 * screen_size[0]/2) + Pcoords[0]), (screen_size[1]/2 - Pcoords[1])];
                    //set the same or opposite ans boxes
                    if (choice_n % 2 !== 0){
                        s_or_o = 'S';
                        choice_number = choice_n - choice_adjust;
                    } else {
                        s_or_o = 'O';
                        choice_number = choice_n/2;
                    }
                    //add the coordinates to the Pans_boxes dictionary with item number and S or O as the key
                    Pans_boxes['Pans_box_' + choice_number.toString() + s_or_o] = Pcoords;
                    choice_n = choice_n + 1;
                    choice_adjust = choice_adjust + .5;
                }
            }
        }
    } 
    
    mouse_down = false;
    key_resp_3.keys = undefined;
    key_resp_3.rt = undefined;
    _key_resp_3_allKeys = [];
    psychoJS.experiment.addData('instructions.started', globalClock.getTime());
    instructionsMaxDuration = null
    // keep track of which components have finished
    instructionsComponents = [];
    instructionsComponents.push(key_resp_3);
    instructionsComponents.push(inst_feedback_text);
    instructionsComponents.push(text_box_corr);
    
    instructionsComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


var _pj;
var mouse_pos;
function instructionsRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'instructions' ---
    // get current time
    t = instructionsClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // Run 'Each Frame' code from instructions_code1
    var _pj;
    function _pj_snippets(container) {
        function in_es6(left, right) {
            if (((right instanceof Array) || ((typeof right) === "string"))) {
                return (right.indexOf(left) > (- 1));
            } else {
                if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                    return right.has(left);
                } else {
                    return (left in right);
                }
            }
        }
        container["in_es6"] = in_es6;
        return container;
    }
    _pj = {};
    _pj_snippets(_pj);
    
    if (instructions_loop.thisTrial["practice_item"]) {
        if ((type_of_test === "multiple choice")) {
            if ((mouse.getPressed()[0] && (! mouse_down))) {
                mouse_pos = mouse.getPos();
                for (let Pans_box, _pj_c = 0, _pj_a = Object.values(Pans_boxes), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    Pans_box = _pj_a[_pj_c];
                    let Ptop_bound = Pans_box[1];
                    let Pbottom_bound = (Pans_box[1] - selector_box.size[1]);
                    let Pleft_bound = Pans_box[0];
                    let Pright_bound = (Pans_box[0] + selector_box.size[0]);
                    
                    if (((((mouse_pos[1] <= Ptop_bound) && (mouse_pos[1] >= Pbottom_bound)) && (mouse_pos[0] >= Pleft_bound)) && (mouse_pos[0] <= Pright_bound))) {
                        for (let Pbox, _pj_f = 0, _pj_d = Object.entries(Pans_boxes), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                            Pbox = _pj_d[_pj_f];
                            if ((Pbox[1] == Pans_box)) {
                                Pclicked_stim = Pbox[0];
                            }
                        }
                        if (Pclicked_stim == Pcurrently_selected) {
                            Pcurrently_selected = [];
                            selector_box.setPos([-2000 * scale, 0]);
                            selector_box.setAutoDraw(false);
                            selector_box.setAutoDraw(true);
                        } else {
                            selector_box.setPos([(Pans_box[0] + (selector_box.size[0] / 2)), (Pans_box[1] - (selector_box.size[1] / 2))]);
                            Pcurrently_selected = Pclicked_stim;
                            selector_box.setAutoDraw(false);
                            selector_box.setAutoDraw(true);
                        }
                    
                    }
                }
                mouse_down = true;
            }
            
            if ((! mouse.getPressed()[0])) {
                mouse_down = false;
            }
        
        } else if ((type_of_test === "multiple selections")) {
            if ((mouse.getPressed()[0] && (! mouse_down))) {
                mouse_pos = mouse.getPos();
                mouse_down = true;
                for (var click_box, _pj_c = 0, _pj_a = Object.values(click_boxes), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    click_box = _pj_a[_pj_c];
                    if (mouse.isPressedIn(click_box)) {
                        if (_pj.in_es6(click_box, currently_selected)) {
                            const box_index = currently_selected.indexOf(click_box);
                            if (box_index > -1) {
                                currently_selected.splice(box_index, 1);
                            }
                            //click_box.setFillColor(new util.Color([1,1,1]));
                            for (let selector_image of selector_images) {
                                if (selector_image.pos[0] == click_box.pos[0] && selector_image.pos[1] == click_box.pos[1]){
                                    selector_image.setAutoDraw(false);  // Hide the feedback image
                                }
                            }                       
                        } else {
                            currently_selected.push(click_box);
                            //click_box.setFillColor(new util.Color([0,0,0]));
                            let selector_exists = false;
                            //create a selector image at the clicked box
                            for (let selector_image of selector_images){
                                if (selector_image.pos[0] == click_box.pos[0] && selector_image.pos[1] == click_box.pos[1]){
                                    selector_image.setAutoDraw(true);
                                    selector_exists = true;
                                }
                            }
                            if (selector_exists == false){
                                let selector_image = new visual.ImageStim({
                                    win: psychoJS.window,
                                    image: test_loop.thisTrial['selector_box_image'],  
                                    pos: click_box.pos,
                                    size: [click_box.size[0]/2, click_box.size[1]/2],
                                    depth: -100
                                    });
                                selector_image.setAutoDraw(true);  // Show the feedback
                                selector_images.push(selector_image);  // Add to tracking array
                            }
                        }
                    }
                }
            }
            if ((! mouse.getPressed()[0])) {
                mouse_down = false;
            }
        } else if (type_of_test == 'fill in the blank'){
                    //text_entry_box.setPos([instructions_loop.thisTrial["textbox_position"][0] * scale, instructions_loop.thisTrial["textbox_position"][1] * scale]);
                    //text_entry_box.setSize([Number(instructions_loop.thisTrial["textbox_size"][0]) * scale, Number(instructions_loop.thisTrial["textbox_size"][1]) * scale]);
    
        } else if ((type_of_test === "same different")) {
            if ((mouse.getPressed()[0] && (! mouse_down))) { //if mouse was clicked but not held down
                mouse_pos = mouse.getPos();
                mouse_down = true;
                //loop through all answer box locations
                for (let Pans_box of Object.values(Pans_boxes)) {
                    let sel_size = instructions_loop.thisTrial['selector_sizeP'] //get size of selector image
                    sel_size = [Number(sel_size[0]) * scale, Number(sel_size[1]) * scale];
                    let Ptop_bound = Pans_box[1];
                    let Pbottom_bound = (Pans_box[1] - sel_size[1]);
                    let Pleft_bound = Pans_box[0];
                    let Pright_bound = (Pans_box[0] + sel_size[0]);        
                    //check if each answer box was just clicked on
                    if (((((mouse_pos[1] <= Ptop_bound) && (mouse_pos[1] >= Pbottom_bound)) && (mouse_pos[0] >= Pleft_bound)) && (mouse_pos[0] <= Pright_bound))) {
                        for (let Pbox, _pj_f = 0, _pj_d = Object.entries(Pans_boxes), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                            Pbox = _pj_d[_pj_f];
                            if ((Pbox[1] == Pans_box)) {
                                //set it to Pclicked_stim if it was
                                Pclicked_stim = Pbox[0];
                            }
                        }
                        //check if the clicked answer box was already selected
                        if (SDcurrently_selected.includes(Pclicked_stim)) {
                           for (let selector_image of selector_images){
                               if (selector_image.name == 'sel' + Pclicked_stim){
                                   //make it invisible if it was already clicked
                                   selector_image.setAutoDraw(false);
                               }
                           }
                           //remove it from list of currently selected answer boxes
                           const box_index = SDcurrently_selected.indexOf(Pclicked_stim);
                           if (box_index > -1) {
                               SDcurrently_selected.splice(box_index, 1);
                           }
                       //if the clicked answer box wasn't already selected
                        } else {
                            let selector_exists = false; //check if selector image already drawn
                            for (let selector_image of selector_images){
                                if (selector_image.name == 'sel' + Pclicked_stim){
                                    selector_exists = true; //if selector image for current ans choice is already in selector_images list
                                    selector_image.setAutoDraw(true);
                                }
                            }
                            //if selector image wasn't already drawn, draw it
                            if (selector_exists == false){
                                let sel_size = instructions_loop.thisTrial['selector_sizeP'];
                                sel_size = [Number(sel_size[0]) * scale, Number(sel_size[1]) * scale]
                                let selector_image = new visual.ImageStim({
                                    win: psychoJS.window,
                                    image: test_loop.thisTrial['selector_box_image'],  
                                    pos: [Pans_boxes[Pclicked_stim][0] + sel_size[0]/2, Pans_boxes[Pclicked_stim][1] - sel_size[1]/2],
                                    size: sel_size,
                                    depth: -100,
                                    name: 'sel' + Pclicked_stim
                                    });
                                selector_image.setAutoDraw(true);  // Show the selector image
                                selector_images.push(selector_image);  // Add to tracking array
                            }
                            //check if S or O of same number was selected
                            let s_o = Pclicked_stim.slice(-1);
                            let remove_name;
                            if (s_o == 'S'){
                                remove_name = Pclicked_stim.slice(0,-1) + 'O';
                            } else {
                                remove_name = Pclicked_stim.slice(0,-1) + 'S';
                            }
    
                            let index = SDcurrently_selected.findIndex(item => item == remove_name);
                            if (index > -1){
                                //if the other choice is selected, unselect it
                                SDcurrently_selected.splice(index, 1);
                                //find corresponing selector image and make it invisible
                                for (let selector_image of selector_images){
                                    if (selector_image.name == 'sel' + remove_name){
                                        selector_image.setAutoDraw(false);
                                    }
                                }
                            }
                            //add the clicked answer box to list of currently selected
                            SDcurrently_selected.push(Pclicked_stim);
                        }
                    }
                }
            }
            if ((! mouse.getPressed()[0])) {
                mouse_down = false;
            }
        }
    
    } //if practice item 
    
    
    // *key_resp_3* updates
    if (t >= 0.0 && key_resp_3.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp_3.tStart = t;  // (not accounting for frame time here)
      key_resp_3.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp_3.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp_3.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp_3.clearEvents(); });
    }
    
    if (key_resp_3.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp_3.getKeys({keyList: ['return'], waitRelease: false});
      _key_resp_3_allKeys = _key_resp_3_allKeys.concat(theseKeys);
      if (_key_resp_3_allKeys.length > 0) {
        key_resp_3.keys = _key_resp_3_allKeys[_key_resp_3_allKeys.length - 1].name;  // just the last key pressed
        key_resp_3.rt = _key_resp_3_allKeys[_key_resp_3_allKeys.length - 1].rt;
        key_resp_3.duration = _key_resp_3_allKeys[_key_resp_3_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *inst_feedback_text* updates
    if (t >= 0.0 && inst_feedback_text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      inst_feedback_text.tStart = t;  // (not accounting for frame time here)
      inst_feedback_text.frameNStart = frameN;  // exact frame index
      
      inst_feedback_text.setAutoDraw(true);
    }
    
    
    // *text_box_corr* updates
    if (t >= 0.0 && text_box_corr.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      text_box_corr.tStart = t;  // (not accounting for frame time here)
      text_box_corr.frameNStart = frameN;  // exact frame index
      
      text_box_corr.setAutoDraw(true);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    instructionsComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


var prev_SD_answers;
var prev_ans_index;
function instructionsRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'instructions' ---
    instructionsComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('instructions.stopped', globalClock.getTime());
    // Run 'End Routine' code from instructions_code1
    prev_SD_answers = [];
    
    if (instructions_loop.thisTrial['att_check']){
        previous_attempts = previous_attempts + 1;
    }
    
    if (instructions_loop.thisTrial['practice_item']){
        if ((type_of_test === "multiple choice")) {
            if (Pcurrently_selected.length > 0) {
                instructions_loop.addData("Pselected_answer", Pcurrently_selected);
                if ((Pcurrently_selected == instructions_loop.thisTrial["correct_answerP"])) {
                    instructions_loop.addData("Ppoints", 1);
                    if (instructions_loop.thisTrial['att_check']){
                        prev_att_correct = true;
                    }
                    previous_correct = 1;
                    console.log('correct');
                    //test_score += 1;
                } else {
                    instructions_loop.addData("Ppoints", 0);
                }
                
                let ans_box_keys = Object.keys(Pans_boxes);
                prev_ans_index = ans_box_keys.indexOf(Pcurrently_selected);
            } else {
                instructions_loop.addData("Pselected_answer", "no selection");
                instructions_loop.addData("Ppoints", 0);
                prev_ans_index = "None";
            }
        
    
        }
    
        else if (type_of_test == "multiple selections"){
            Pms_corr = 0;
            Pms_incorr = 0;
            Pms_points = 0;
            let Pselected_answer_list = [];
            if (currently_selected.length){
                for (let i = 0; i < currently_selected.length; i += 1){
                    Pselected_answer_list.push(currently_selected[i].name);
                    if (instructions_loop.thisTrial["correct_answerP"].includes(currently_selected[i].name)){
                        //selected a correct answer
                        Pms_corr += 1
                        } else {
                            //selected an incorrect answer
                            Pms_incorr += 1
                        }
                    }
    
                if (Pms_corr == 2 && Pms_incorr == 0) {
                    //practice item correct
                    previous_correct = 1;
                    Pms_points = 1;
                    //if attention check, then set this var too
                    if (instructions_loop.thisTrial['att_check']){
                        prev_att_correct = true;
                    }
                } else {
                    //practice item incorrect
                    Pms_points = 0;
                    }
            }
            instructions_loop.addData('Pselected_answer', Pselected_answer_list);
            instructions_loop.addData("Ppoints", Pms_points);
            instructions_loop.addData("Pcorrect", Pms_corr);
            instructions_loop.addData("Pincorrect", Pms_incorr);
            
            previously_selected = currently_selected;
            for (let selector_image of selector_images){
                selector_image.setAutoDraw(false);
            }
            selector_images = [];
            for (let click_box of Object.values(click_boxes)){
                click_box.setAutoDraw(false);
            }
        }
    
    
        else if (type_of_test === "fill in the blank") {
            // Get the entered text from the text entry box
            let entered_text = text_entry_box.text;
    
            // Remove new line characters
            let no_return_text = entered_text.replace(/\n/g, "").replace(/\r/g, "");
    
            // Filter out non-alphanumeric characters and convert to lower case
            let clean_text = no_return_text.replace(/[^a-z0-9.]/gi, '');  // Keeps only alphanumeric characters
            clean_text = clean_text.toUpperCase();
    
            // Log the cleaned text to the item loop
            instructions_loop.addData("Pselected_answer", );
            if (clean_text !== ''){
                instructions_loop.addData("Pselected_answer", clean_text);
            } else {
                instructions_loop.addData("Pselected_answer", "no selection");
            }
        
            // Check if the cleaned text matches the correct answer
            if (clean_text === instructions_loop.thisTrial["correct_answerP"]) {
                instructions_loop.addData("Ppoints", 1);
                previous_correct = 1;
                //if correct and att check
                if (instructions_loop.thisTrial['att_check']){
                    prev_att_correct = true;
                }
            } else {
                instructions_loop.addData("Ppoints", 0);
            }
            
            prev_text_box_answer = no_return_text;
            text_entry_box.setText('');
            
        } else if (type_of_test == 'same different'){
            let Psd = 0;
            //score their P answers
            let corr_ans = instructions_loop.thisTrial['correct_answerP']; 
            let sd_corr = 0;
            let sd_incorr = 0;
            let sd_item_score = 0;
            let perf_points = 0;
            for (let ans_box of SDcurrently_selected){
                if (corr_ans.includes(ans_box)){
                    sd_corr++;
                } else {
                    sd_incorr--;
                }
            }
            sd_item_score = sd_corr + sd_incorr;
            if (sd_item_score == choices){
                perf_points++;
                previous_correct = 1;
            }
            //record submitted answer, points
            instructions_loop.addData("Pselected_answer", SDcurrently_selected);
            instructions_loop.addData("Ppoints", perf_points);
            instructions_loop.addData("Pcorrect", sd_corr);
            instructions_loop.addData("Pincorrect", sd_incorr);
            //store their answers for feedback
            prev_SD_answers = SDcurrently_selected;  
            SDcurrently_selected = [];
            for (let selector_image of selector_images){
                selector_image.setAutoDraw(false);
                selector_images = [];
            }
        }
    } else { // if not practice item, check feedback
        if (instructions_loop.thisTrial['feedback']){
            if (type_of_test == 'multiple selections'){
                //clear selector images
                for (let selector_image of selector_images){
                    selector_image.setAutoDraw(false);
                }
                selector_images = [];
                for (let click_box of Object.values(click_boxes)){
                    click_box.setAutoDraw(false);
                }
            } else if (type_of_test == 'same different'){
                //clear the selector images
                for (let selector_image of selector_images){
                    selector_image.setAutoDraw(false);
                }
                selector_images = [];
            }
        }
    }
    
    
    if (current_state == 'quit'){
        psychoJS.quit()
    }
    
    
    key_resp_3.stop();
    // the Routine "instructions" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var repeat_logicMaxDurationReached;
var repeat_logicMaxDuration;
var repeat_logicComponents;
function repeat_logicRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'repeat_logic' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    repeat_logicClock.reset();
    routineTimer.reset();
    repeat_logicMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from repeat_logic_code
    if ((current_state == "advance")) {
        repeat_inst.finished = true;
    }
    
    psychoJS.experiment.addData('repeat_logic.started', globalClock.getTime());
    repeat_logicMaxDuration = null
    // keep track of which components have finished
    repeat_logicComponents = [];
    
    repeat_logicComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function repeat_logicRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'repeat_logic' ---
    // get current time
    t = repeat_logicClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    repeat_logicComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function repeat_logicRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'repeat_logic' ---
    repeat_logicComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('repeat_logic.stopped', globalClock.getTime());
    // the Routine "repeat_logic" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var itemMaxDurationReached;
var image_path;
var ans_boxes;
var letters;
var clicked_stim;
var answerPositionX;
var answerPositionY;
var _key_resp_allKeys;
var gotValidClick;
var itemMaxDuration;
var itemComponents;
function itemRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'item' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    itemClock.reset();
    routineTimer.reset();
    itemMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from item_code1
    
    
    // Shuffle the trial order if using an existing trial handler
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    if (test_loop.thisTrial['randomize'] == 1 && shuffled_trials == false){
        shuffle(item_loop.trialList)
        shuffled_trials = true;
        //force thisTrial to update
        item_loop.thisTrial = item_loop.trialList[0];
    }
    
    
    
    
    if ('type_of_item' in item_loop.trialList[0]){
        type_of_test = item_loop.thisTrial['type_of_item'];
        selector_box.setImage(test_loop.thisTrial['selector_box_image']);
        selector_box.setAutoDraw(false);
        if (Object.values(click_boxes)){
            for (let box of Object.values(click_boxes)){
                box.setAutoDraw(false);
            }
        }
        text_entry_box.setAutoDraw(false);
        
        if (type_of_test == 'multiple selections'){
            click_boxes = {};
            for (var i, _pj_c = 0, _pj_a = util.range(item_loop.thisTrial['answer_positionX'].length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                i = _pj_a[_pj_c];
                click_boxes[("click_box" + i.toString())] = new visual.Rect({
                                                                             win: psychoJS.window,                                                                     name: "Rclick_box" + i.toString(),
                                                                             //edges: 4,
                                                                             size: [200 * scale, 200 * scale],
                                                                             pos: [0, 0],
                                                                             lineColor: new util.Color([-1,-1,-1]),
                                                                             fillColor: new util.Color([1,1,1]),
                                                                             lineWidth: 5 * scale,
                                                                             units: 'pix',        // Specify units
                                                                             opacity: 1.0,       // Fully opaque
                                                                             depth: -100,           // Default depth
                                                                             autoDraw: true,       // Draw automatically
                                                                             colorSpace: "rgb"
                                                                             });
            }
        }
    }
    
    //set selector image if needed
    //if ('selector_box_image' in item_loop.trialList[0]){
    //    selector_box.setImage(item_loop.thisTrial['selector_box_image']);
    //}
    
    let standard_stim_val = item_loop.thisTrial["standard_stim"];
    image_path = /^https?:\/\//i.test(standard_stim_val) ? standard_stim_val : (stim_folder + "/" + standard_stim_val);
    item_stim.setImage(image_path);
    item_stim.setSize([1920 * scale, 1080 * scale]);
    item_stim.setPos([0,0]);
    // In case the instructions loop just showed custom instructions text,
    // make sure it doesn't stay drawn on top of the real trial.
    custom_instructions_stim.setAutoDraw(false);
    
    ans_boxes = {};
    letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    currently_selected = null;
    clicked_stim = null;
    sel_size = 0;
    selector_images = [];
    SDcurrently_selected = [];
    s_or_o = 'S';
    choice_number = 0;
    
    if ((type_of_test === "multiple choice")) {
        let answerPositionX = item_loop.thisTrial["answer_positionX"];
        let answerPositionY = item_loop.thisTrial["answer_positionY"];
        
        for (var i, _pj_c = 0, _pj_a = util.range(answerPositionX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            let i = _pj_a[_pj_c];
            let l = letters[i];
            let coords = [Number(answerPositionX[i]) * scale, Number(answerPositionY[i]) * scale];
            coords = [((-1 * screen_size[0]/2) + coords[0]), ((screen_size[1]/2) - coords[1])];
            ans_boxes['ans_box_' + l.toString()] = coords;
         
        }
        selector_box.setPos([-2000 * scale, 0]);
        selector_size = [Number(item_loop.thisTrial["selector_size"][0]) * scale, Number(item_loop.thisTrial["selector_size"][1]) * scale];
        selector_box.setSize(selector_size);
        selector_box.setAutoDraw(false);
        selector_box.setAutoDraw(true);
        
    }
    if ((type_of_test === "multiple selections")) {
        console.log('mult selec');
        let answerPositionX = item_loop.thisTrial['answer_positionX'];
        let answerPositionY = item_loop.thisTrial['answer_positionY'];
        
        for (var i, _pj_c = 0, _pj_a = util.range(answerPositionX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            i = _pj_a[_pj_c];
            sel_size = [Number(item_loop.thisTrial["selector_size"][0]) * scale, Number(item_loop.thisTrial["selector_size"][1]) * scale];
            coords = [Number(answerPositionX[i]) * scale, Number(answerPositionY[i]) * scale];
            coords = [((-1 * screen_size[0]/2) + coords[0] + sel_size[0]/2), ((screen_size[1]/2) - coords[1] - sel_size[1]/2)];
            click_boxes["click_box" + i.toString()].setPos(coords);
            click_boxes["click_box" + i.toString()].setSize([sel_size[0] * 2, sel_size[1] * 2]);
            click_boxes["click_box" + i.toString()].setFillColor(new util.Color([1,1,1]));
            click_boxes["click_box" + i.toString()].setAutoDraw(false);
            click_boxes["click_box" + i.toString()].setAutoDraw(true);
        }


        currently_selected = [];
    }
    if ((type_of_test === "fill in the blank")) {
            console.log('fill blank');
            text_entry_box.setPos([item_loop.thisTrial["textbox_position"][0] * scale, item_loop.thisTrial["textbox_position"][1] * scale]);
            text_entry_box.setSize([Number(item_loop.thisTrial["textbox_size"][0]) * scale, Number(item_loop.thisTrial["textbox_size"][1]) * scale]);
            text_entry_box.editable = true;
            text_entry_box.text = '';
            text_entry_box.autofocus = false;
            text_entry_box.autofocus = true;
            text_entry_box.setAutoDraw(false);
            text_entry_box.setAutoDraw(true);
    }
    if (type_of_test == "same different"){
        answerPositionX = item_loop.thisTrial["answer_positionX"];
        answerPositionY = item_loop.thisTrial["answer_positionY"];
        
        let choice_adjust = 0; //subtract an increasing integer to get the 'S' ans choice numbers
        let choice_n = 1;
        
        for (var x, _pj_c = 0, _pj_a = util.range(answerPositionX.length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            x = _pj_a[_pj_c];
            coords = [Number(answerPositionX[x]) * scale, Number(answerPositionY[x] * scale)];
            coords = [((-1 * screen_size[0]/2) + coords[0]), (screen_size[1]/2 - coords[1])];
            //set the same or opposite ans boxes
            if (choice_n % 2 !== 0){
                s_or_o = 'S';
                choice_number = choice_n - choice_adjust;
            } else {
                s_or_o = 'O';
                choice_number = choice_n/2;
            }
            //add the coordinates to the Pans_boxes dictionary with item number and S or O as the key
            ans_boxes['ans_box_' + choice_number.toString() + s_or_o] = coords;
            choice_n = choice_n + 1;
            choice_adjust = choice_adjust + .5;
        }
    }        
    
    mouse_down = false;
    if ((! score_dict_set)) {
        //score_dict[name_of_test]["prev_scores"] = item_loop.thisTrial["prev_scores"];
        score_dict[name_of_test]["possible"] = item_loop.nTotal;
        score_dict_set = true;
    }
    
    //'press Enter text'
    key_inst_text.setColor([.7, .7, .7]);
    key_inst_text.setPos([0, -520 * scale]);
    key_inst_text.wrapWidth = 1800 * scale;
    key_inst_text.height = 35 * scale;
    key_inst_text.setAutoDraw(false);
    key_inst_text.setAutoDraw(true);
    
    if (name_of_test == 'AC1' || name_of_test == 'AC2'){
        continueRoutine = false;
    }
    
    trialClock.reset();
    
    if (item_loop.thisN === 0){
        testClock.reset();
    }
    key_resp.keys = undefined;
    key_resp.rt = undefined;
    _key_resp_allKeys = [];
    // setup some python lists for storing info about the mouse
    gotValidClick = false; // until a click is received
    psychoJS.experiment.addData('item.started', globalClock.getTime());
    itemMaxDuration = null
    // keep track of which components have finished
    itemComponents = [];
    itemComponents.push(key_resp);
    itemComponents.push(mouse);
    itemComponents.push(key_inst_text);
    
    itemComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function itemRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'item' ---
    // get current time
    t = itemClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // Run 'Each Frame' code from item_code1
    var _pj;
    function _pj_snippets(container) {
        function in_es6(left, right) {
            if (((right instanceof Array) || ((typeof right) === "string"))) {
                return (right.indexOf(left) > (- 1));
            } else {
                if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                    return right.has(left);
                } else {
                    return (left in right);
                }
            }
        }
        container["in_es6"] = in_es6;
        return container;
    }
    _pj = {};
    _pj_snippets(_pj);
    
    if ((type_of_test === "multiple choice")) {
        if ((mouse.getPressed()[0] && (! mouse_down))) {
            mouse_pos = mouse.getPos();
            for (let ans_box, _pj_c = 0, _pj_a = Object.values(ans_boxes), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                ans_box = _pj_a[_pj_c];
                let top_bound = ans_box[1];
                let bottom_bound = ans_box[1] - Number(selector_box.size[1]);
                let left_bound = ans_box[0];
                let right_bound = ans_box[0] + Number(selector_box.size[0]);
                if (((((mouse_pos[1] <= top_bound) && (mouse_pos[1] >= bottom_bound)) && (mouse_pos[0] >= left_bound)) && (mouse_pos[0] <= right_bound))) {
                    for (let box, _pj_f = 0, _pj_d = Object.entries(ans_boxes), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                        box = _pj_d[_pj_f];
                        if ((box[1] == ans_box)) {
                            clicked_stim = box[0];
                        }
                    }
                    if ((clicked_stim == currently_selected)) {
                        currently_selected = null;
                        selector_box.setPos([-2000 * scale, 0]);
                        selector_box.setAutoDraw(false);
                        selector_box.setAutoDraw(true);
                    } else {
                        selector_box.setPos([(ans_box[0] + (selector_box.size[0] / 2)), (ans_box[1] - (selector_box.size[1] / 2))]);
                        selector_box.setAutoDraw(false);
                        selector_box.setAutoDraw(true);
                        currently_selected = clicked_stim;
                    }
                }
            }
            selector_box.setAutoDraw(false);
            selector_box.setAutoDraw(true);
            mouse_down = true;
        }
        if ((! mouse.getPressed()[0])) {
            mouse_down = false;
        }
    } else if ((type_of_test === "multiple selections")) {
            if ((mouse.getPressed()[0] && (! mouse_down))) {
                mouse_pos = mouse.getPos();
                for (var click_box, _pj_c = 0, _pj_a = Object.values(click_boxes), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    click_box = _pj_a[_pj_c];
                    if (mouse.isPressedIn(click_box)) {
                        if (_pj.in_es6(click_box, currently_selected)) {
                            const box_index = currently_selected.indexOf(click_box);
                            if (box_index > -1) {
                            currently_selected.splice(box_index, 1);
                            }
                            //click_box.setFillColor(new util.Color([1,1,1]));
                            for (let selector_image of selector_images) {
                                if (selector_image.pos[0] == click_box.pos[0] && selector_image.pos[1] == click_box.pos[1]){
                                    selector_image.setAutoDraw(false);  // Hide the feedback image
                                }
                            }     
                        } else {
                            currently_selected.push(click_box);
                            //click_box.setFillColor(new util.Color([0,0,0]));
                            let selector_exists = false;
                            //create a selector image at the clicked box
                            for (let selector_image of selector_images){
                                if (selector_image.pos[0] == click_box.pos[0] && selector_image.pos[1] == click_box.pos[1]){
                                    selector_image.setAutoDraw(true);
                                    selector_exists = true;
                                }
                            }
                            if (selector_exists == false){
                                let selector_image = new visual.ImageStim({
                                    win: psychoJS.window,
                                    image: test_loop.thisTrial['selector_box_image'],  
                                    pos: click_box.pos,
                                    size: [click_box.size[0]/2, click_box.size[1]/2],
                                    depth: -100
                                    });
                                console.log('click size');
                                console.log(click_box.size);
                                selector_image.setAutoDraw(true);  // Show the feedback
                                selector_images.push(selector_image);  // Add to tracking array
                            }
                        }
                    }
                }
                mouse_down = true;
            }
            if ((! mouse.getPressed()[0])) {
                mouse_down = false;
            } 
    } else if (type_of_test == 'same different'){
            if ((mouse.getPressed()[0] && (! mouse_down))) { //if mouse was clicked but not held down
                mouse_pos = mouse.getPos();
                mouse_down = true;
                //loop through all answer box locations
                for (let ans_box of Object.values(ans_boxes)) {
                    let sel_size = item_loop.thisTrial['selector_size'] //get size of selector image
                    sel_size = [Number(sel_size[0]) * scale, Number(sel_size[1]) * scale];
                    let top_bound = ans_box[1];
                    let bottom_bound = (ans_box[1] - sel_size[1]);
                    let left_bound = ans_box[0];
                    let right_bound = (ans_box[0] + sel_size[0]);        
                    //check if each answer box was just clicked on
                    if (((((mouse_pos[1] <= top_bound) && (mouse_pos[1] >= bottom_bound)) && (mouse_pos[0] >= left_bound)) && (mouse_pos[0] <= right_bound))) {
                        for (let box of Object.entries(ans_boxes)) {
                            if ((box[1] == ans_box)) {
                                //set it to Pclicked_stim if it was
                                clicked_stim = box[0];
                            }
                        }
                        //check if the clicked answer box was already selected
                        if (SDcurrently_selected.includes(clicked_stim)) {
                           for (let selector_image of selector_images){
                               if (selector_image.name == 'sel' + clicked_stim){
                                   //make it invisible if it was already clicked
                                   selector_image.setAutoDraw(false);
                               }
                           }
                           //remove it from list of currently selected answer boxes
                           const box_index = SDcurrently_selected.indexOf(clicked_stim);
                           if (box_index > -1) {
                               SDcurrently_selected.splice(box_index, 1);
                           }
                       //if the clicked answer box wasn't already selected
                        } else {
                            let selector_exists = false; //check if selector image already drawn
                            for (let selector_image of selector_images){
                                if (selector_image.name == 'sel' + clicked_stim){
                                    selector_exists = true; //if selector image for current ans choice is already in selector_images list
                                    selector_image.setAutoDraw(true);
                                }
                            }
                            //if selector image wasn't already drawn, draw it
                            if (selector_exists == false){
                                let sel_size = item_loop.thisTrial['selector_size'];
                                sel_size = [Number(sel_size[0]) * scale, Number(sel_size[1]) * scale]
                                let selector_image = new visual.ImageStim({
                                    win: psychoJS.window,
                                    image: test_loop.thisTrial['selector_box_image'],  
                                    pos: [ans_boxes[clicked_stim][0] + sel_size[0]/2, ans_boxes[clicked_stim][1] - sel_size[1]/2],
                                    size: sel_size,
                                    depth: -100,
                                    name: 'sel' + clicked_stim
                                    });
                                selector_image.setAutoDraw(true);  // Show the selector image
                                selector_images.push(selector_image);  // Add to tracking array
                            }
                            //check if S or O of same number was selected
                            let s_o = clicked_stim.slice(-1);
                            let remove_name;
                            if (s_o == 'S'){
                                remove_name = clicked_stim.slice(0,-1) + 'O';
                            } else {
                                remove_name = clicked_stim.slice(0,-1) + 'S';
                            }
    
                            let index = SDcurrently_selected.findIndex(item => item == remove_name);
                            if (index > -1){
                                //if the other choice is selected, unselect it
                                SDcurrently_selected.splice(index, 1);
                                //find corresponing selector image and make it invisible
                                for (let selector_image of selector_images){
                                    if (selector_image.name == 'sel' + remove_name){
                                        selector_image.setAutoDraw(false);
                                    }
                                }
                            }
                            //add the clicked answer box to list of currently selected
                            SDcurrently_selected.push(clicked_stim);
                        }
                    }
                }         
                mouse_down = true;
            }
            if ((! mouse.getPressed()[0])) {
                mouse_down = false;
            }
    } 
    
    //press enter text
    if (trialClock.getTime() >= Number(test_loop.thisTrial['time_min'])){
        key_inst_text.setColor([-1,-1,-1]);
        key_inst_text.setAutoDraw(false);
        key_inst_text.setAutoDraw(true);
    }
    
    if (Number(test_loop.thisTrial['total_time_limit']) === 1){
        if (testClock.getTime() >= Number(test_loop.thisTrial["time_max"])){
            item_loop.finished = true;
            continueRoutine = false;
        }
    }
    
    if (Number(test_loop.thisTrial['time_max']) !== -1 && trialClock.getTime() >= Number(test_loop.thisTrial["time_max"])) {  // Check if 60 seconds have passed
        // Advance to the next trial
        //trialClock.reset();
        // Move to the next item in the loop
        continueRoutine = false;  
    }
    
    
    // *key_resp* updates
    if (t >= time_min && key_resp.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp.tStart = t;  // (not accounting for frame time here)
      key_resp.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp.clearEvents(); });
    }
    
    if (key_resp.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp.getKeys({keyList: ['return'], waitRelease: false});
      _key_resp_allKeys = _key_resp_allKeys.concat(theseKeys);
      if (_key_resp_allKeys.length > 0) {
        key_resp.keys = _key_resp_allKeys.map((key) => key.name);  // storing all keys
        key_resp.rt = _key_resp_allKeys.map((key) => key.rt);
        key_resp.duration = _key_resp_allKeys.map((key) => key.duration);
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *key_inst_text* updates
    if (t >= 0.0 && key_inst_text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_inst_text.tStart = t;  // (not accounting for frame time here)
      key_inst_text.frameNStart = frameN;  // exact frame index
      
      key_inst_text.setAutoDraw(true);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    itemComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


var perf_points;
var sd_item_score;
function itemRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'item' ---
    itemComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('item.stopped', globalClock.getTime());
    // Run 'End Routine' code from item_code1
    if ((type_of_test === "multiple choice")) {
        if (currently_selected) {
            item_loop.addData("selected_answer", currently_selected);
            if ((currently_selected === item_loop.thisTrial["correct_answer"])) {
                item_loop.addData("points", 1);
                item_loop.addData("correct", 1);
                item_loop.addData("incorrect", 0);
                test_score += 1;
            } else { //incorrect choice
                item_loop.addData("points", 0);
                item_loop.addData("correct", 0);
                item_loop.addData("incorrect", -1);
            }
        } else { //no attempt
            item_loop.addData("selected_answer", "no selection");
            item_loop.addData("points", 0);        
            item_loop.addData("correct", 0);
            item_loop.addData("incorrect", 0);
        }
    } else {
    if (type_of_test === "fill in the blank") {
        // Get the entered text from the text entry box
        let entered_text = text_entry_box.text;
    
        // Remove new line characters
        let clean_text = entered_text.replace(/\n/g, "").replace(/\r/g, "");
    
        // Filter out non-alphanumeric characters and convert to lower case
        clean_text = clean_text.replace(/[^a-z0-9.]/gi, '');  // Keeps only alphanumeric characters
        clean_text = clean_text.toUpperCase();
    
        // Log the cleaned text to the item loop
        item_loop.addData("selected_answer", clean_text);
    
        // Check if the cleaned text matches the correct answer
        if (clean_text === item_loop.thisTrial["correct_answer"]) {
            item_loop.addData("points", 1);
            item_loop.addData("correct", 1);
            item_loop.addData("correct", 0);
            test_score += 1;
        } else if (clean_text == ''){ //no attempt
            item_loop.addData("points", 0);
            item_loop.addData("correct", 0);
            item_loop.addData("incorrect", 0);
        } else { //incorrect entry
            item_loop.addData("points", 0);
            item_loop.addData("correct", 0);
            item_loop.addData("incorrect", -1);
        }
    
        text_entry_box.setText('');
        
    }
    }
    
    if (type_of_test == "multiple selections"){
        let ms_corr = 0;
        let ms_incorr = 0;
        let perf_points = 0;
        let selected_answer_list = [];
        if (currently_selected.length){
            for (let i = 0; i < currently_selected.length; i += 1){
                selected_answer_list.push(currently_selected[i].name);
                if (item_loop.thisTrial["correct_answer"].includes(currently_selected[i].name)){
                    ms_corr += 1
                    } else {
                        ms_incorr -= 1
                    }
                }
             if (ms_corr + ms_incorr == 2) {
                test_score += 1;
                perf_points = 1;
            }
        }
            item_loop.addData("selected_answer", selected_answer_list);
            item_loop.addData("correct", ms_corr);
            item_loop.addData("incorrect", ms_incorr);
            item_loop.addData("points", perf_points);
        for (let selector_image of selector_images){
            selector_image.setAutoDraw(false);
        }
        selector_images = [];
    }
    if (type_of_test == 'same different'){
        //clear the selector images
        for (let selector_image of selector_images){
            selector_image.setAutoDraw(false);
        }
        selector_images = [];
        
        //score their answers
        let corr_ans = item_loop.thisTrial['correct_answer']; 
        let sd_corr = 0;
        let sd_incorr = 0;
        let sd_item_score = 0;
        let perf_points = 0;
        for (let ans_box of SDcurrently_selected){
            if (corr_ans.includes(ans_box)){
                sd_corr++;
            } else {
                sd_incorr--;
            }
        }
        sd_item_score = sd_corr + sd_incorr;
        if (sd_item_score == choices){
            perf_points++;
        }
        item_loop.addData("selected_answer", SDcurrently_selected);
        item_loop.addData("points", perf_points);
        item_loop.addData("correct", sd_corr);
        item_loop.addData("incorrect", sd_incorr);
        test_score += sd_item_score
    }
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(key_resp.corr, level);
    }
    psychoJS.experiment.addData('key_resp.keys', key_resp.keys);
    if (typeof key_resp.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('key_resp.rt', key_resp.rt);
        psychoJS.experiment.addData('key_resp.duration', key_resp.duration);
        routineTimer.reset();
        }
    
    key_resp.stop();
    // store data for psychoJS.experiment (ExperimentHandler)
    // the Routine "item" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var score_breakMaxDurationReached;
var tests_complete;
var tests_total;
var _break_key_press_allKeys;
var score_breakMaxDuration;
var score_breakComponents;
function score_breakRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'score_break' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    score_breakClock.reset();
    routineTimer.reset();
    score_breakMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from score_code
    blank_screen3.setSize([1920 * scale, 1080 * scale]);
    blank_screen3.setAutoDraw(false);
    blank_screen3.setAutoDraw(true);
    if (name_of_test == 'ACF' || name_of_test == 'AC1' || name_of_test == 'AC2' || name_of_test == 'Demos'){
        continueRoutine = false;
    }
    
    if (test_loop.thisTrial['include_score'] == 1){
        score_dict[name_of_test]["score"] = test_score;
    } else {
        score_dict[name_of_test]["score"] = 'exclude';
    }
    
    if ((type_of_test === "fill in the blank")) {
        text_entry_box.setPos([(-2000 * scale), 0]);
        text_entry_box.setEditable(false);
    }
    selector_box.setPos([(-2000 * scale), 0]);
    if ((click_boxes != null)) {
        if ((Object.values(click_boxes).length > 0)) {
            for (var i, _pj_c = 0, _pj_a = util.range(Object.values(click_boxes).length), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                i = _pj_a[_pj_c];
                click_boxes[("click_box" + i.toString())].setAutoDraw(false);
            }
        }
    }
    
    //tell the participant how many tests they've done so far
    //and how many left to go
    tests_complete = Object.keys(score_dict).length;
    for (let key of Object.keys(score_dict)){
        if (key == 'AC1' || key == 'AC2' || key == 'ACF' || key == 'Demos'){
            tests_complete--;
        }
    }
    // exclude attention checks / demographics from the "tests completed" count
    tests_total = test_loop.trialList.filter((test) => !['AC1', 'AC2', 'ACF', 'Demos'].includes(test['name_of_test'])).length;
    
    break_message_text.text = (customBreakMessageCounter || 'You have completed {completed} out of {total} tests.')
        .replace('{completed}', tests_complete.toString())
        .replace('{total}', tests_total.toString());
    break_message_text.setPos([0, 400 * scale]);
    break_message_text.height = 35 * scale;
    break_message_text.setWrapWidth(1200 * scale);
    break_message_text.setAutoDraw(false);
    break_message_text.setAutoDraw(true);

    if (customBreakMessage){
        break_message.text = customBreakMessage;
    } else if (tests_complete < tests_total){
        break_message.text = 'Good job! You have finished this test. Feel free to take a break now before beginning the next test, but try not to stop in the middle of a test. Press Enter when you are ready to move on to the next test.'
    } else {
        break_message.text = 'Good job! You have finished this test. Press Enter to continue.';
    }
    break_message.height = 35 * scale;
    break_message.setWrapWidth(1200 * scale);
    break_message.setAutoDraw(false);
    break_message.setAutoDraw(true);
    
    break_key_press.keys = undefined;
    break_key_press.rt = undefined;
    _break_key_press_allKeys = [];
    score_breakMaxDuration = null
    // keep track of which components have finished
    score_breakComponents = [];
    score_breakComponents.push(blank_screen3);
    score_breakComponents.push(break_key_press);
    score_breakComponents.push(break_message);
    score_breakComponents.push(break_message_text);
    
    score_breakComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function score_breakRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'score_break' ---
    // get current time
    t = score_breakClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *blank_screen3* updates
    if (t >= 0.0 && blank_screen3.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      blank_screen3.tStart = t;  // (not accounting for frame time here)
      blank_screen3.frameNStart = frameN;  // exact frame index
      
      blank_screen3.setAutoDraw(true);
    }
    
    
    // *break_key_press* updates
    if (t >= 0.0 && break_key_press.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      break_key_press.tStart = t;  // (not accounting for frame time here)
      break_key_press.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { break_key_press.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { break_key_press.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { break_key_press.clearEvents(); });
    }
    
    if (break_key_press.status === PsychoJS.Status.STARTED) {
      let theseKeys = break_key_press.getKeys({keyList: ['return'], waitRelease: false});
      _break_key_press_allKeys = _break_key_press_allKeys.concat(theseKeys);
      if (_break_key_press_allKeys.length > 0) {
        break_key_press.keys = _break_key_press_allKeys[_break_key_press_allKeys.length - 1].name;  // just the last key pressed
        break_key_press.rt = _break_key_press_allKeys[_break_key_press_allKeys.length - 1].rt;
        break_key_press.duration = _break_key_press_allKeys[_break_key_press_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *break_message* updates
    if (t >= 0.0 && break_message.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      break_message.tStart = t;  // (not accounting for frame time here)
      break_message.frameNStart = frameN;  // exact frame index
      
      break_message.setAutoDraw(true);
    }
    
    
    // *break_message_text* updates
    if (t >= 0.0 && break_message_text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      break_message_text.tStart = t;  // (not accounting for frame time here)
      break_message_text.frameNStart = frameN;  // exact frame index
      
      break_message_text.setAutoDraw(true);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    score_breakComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function score_breakRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'score_break' ---
    score_breakComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(break_key_press.corr, level);
    }
    psychoJS.experiment.addData('break_key_press.keys', break_key_press.keys);
    if (typeof break_key_press.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('break_key_press.rt', break_key_press.rt);
        psychoJS.experiment.addData('break_key_press.duration', break_key_press.duration);
        routineTimer.reset();
        }
    
    break_key_press.stop();
    // the Routine "score_break" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var feedbackMaxDurationReached;
var k;
var number_of_tests;
var spacing;
var feedback_text_lines;
var _key_resp_2_allKeys;
var feedbackMaxDuration;
var feedbackComponents;
function feedbackRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'feedback' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    feedbackClock.reset();
    routineTimer.reset();
    feedbackMaxDurationReached = false;
    // update component parameters for each repeat
    // Run 'Begin Routine' code from feedback_code
    //image_stim.setImage = None;
    //image_stim.setAutoDraw(false);
    //image_stim.setAutoDraw(true);
    
    k = 0;
    number_of_tests = Object.keys(score_dict).length;
    spacing = (psychoJS.window.size[1] / (number_of_tests * 1.5));
    feedback_text_lines = {};
    
    feedback_text.height = 40 * scale;
    feedback_text.wrapWidth = screen_size[0] * .8;
    //console.log(number_of_tests);
    
    let test_skip = 0;
    for (let test of Object.keys(score_dict)){
        //console.log(score_dict[test]['score']);
        if (score_dict[test]['score'] == "exclude"){  
            test_skip++;
        }
    }
        //if all tests are marked to not score
    if (test_skip >= number_of_tests){
        continueRoutine = false;
        feedback_text.text = 'Thank you for completing this experiment! Press Enter to close the page.';
    } else {
        for (var test, _pj_c = 0, _pj_a = Object.keys(score_dict), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            let test = _pj_a[_pj_c];
            let test_name = Object.keys(score_dict)[k];
            let test_score_dict = Object.values(score_dict)[k];
            let score = test_score_dict["score"];
            let possible = test_score_dict["possible"];
            let score_text = test_name + ": " + score.toString() + " out of " + possible.toString();
            feedback_text.text = feedback_text.text + '\n' + '\n' + score_text;
            prev_scores = test_score_dict["prev_scores"];
            if (typeof prev_scores === 'string') {
                try { prev_scores = JSON.parse(prev_scores); } catch (e) { prev_scores = []; }
            }
            if (!Array.isArray(prev_scores)) prev_scores = [];
            // No comparison data yet for this test — show the raw score only,
            // skip the percentile line rather than displaying 0/NaN.
            if (prev_scores.length > 0) {
                let rank = 0;
                for (var s, _pj_f = 0, _pj_d = prev_scores, _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                    s = _pj_d[_pj_f];
                    if ((score >= s)) {
                        rank += 1;
                    }
                }
                let percentile = Math.round((rank / prev_scores.length) * 100);
                feedback_text.text = feedback_text.text + '\n\n' + 'You scored better than ' + percentile + '% of previous participants.';
            }
            k += 1;
        }
    }
    
    key_resp_2.keys = undefined;
    key_resp_2.rt = undefined;
    _key_resp_2_allKeys = [];
    psychoJS.experiment.addData('feedback.started', globalClock.getTime());
    feedbackMaxDuration = null
    // keep track of which components have finished
    feedbackComponents = [];
    feedbackComponents.push(blank_screen2);
    feedbackComponents.push(blank_screen);
    feedbackComponents.push(key_resp_2);
    feedbackComponents.push(feedback_text);
    
    feedbackComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function feedbackRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'feedback' ---
    // get current time
    t = feedbackClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *blank_screen2* updates
    if (t >= 0.0 && blank_screen2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      blank_screen2.tStart = t;  // (not accounting for frame time here)
      blank_screen2.frameNStart = frameN;  // exact frame index
      
      blank_screen2.setAutoDraw(true);
    }
    
    
    // *blank_screen* updates
    if (t >= 0.0 && blank_screen.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      blank_screen.tStart = t;  // (not accounting for frame time here)
      blank_screen.frameNStart = frameN;  // exact frame index
      
      blank_screen.setAutoDraw(true);
    }
    
    
    // *key_resp_2* updates
    if (t >= 0.0 && key_resp_2.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      key_resp_2.tStart = t;  // (not accounting for frame time here)
      key_resp_2.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { key_resp_2.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { key_resp_2.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { key_resp_2.clearEvents(); });
    }
    
    if (key_resp_2.status === PsychoJS.Status.STARTED) {
      let theseKeys = key_resp_2.getKeys({keyList: ['return'], waitRelease: false});
      _key_resp_2_allKeys = _key_resp_2_allKeys.concat(theseKeys);
      if (_key_resp_2_allKeys.length > 0) {
        key_resp_2.keys = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].name;  // just the last key pressed
        key_resp_2.rt = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].rt;
        key_resp_2.duration = _key_resp_2_allKeys[_key_resp_2_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *feedback_text* updates
    if (t >= 0.0 && feedback_text.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      feedback_text.tStart = t;  // (not accounting for frame time here)
      feedback_text.frameNStart = frameN;  // exact frame index
      
      feedback_text.setAutoDraw(true);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    feedbackComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function feedbackRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'feedback' ---
    feedbackComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('feedback.stopped', globalClock.getTime());
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(key_resp_2.corr, level);
    }
    psychoJS.experiment.addData('key_resp_2.keys', key_resp_2.keys);
    if (typeof key_resp_2.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('key_resp_2.rt', key_resp_2.rt);
        psychoJS.experiment.addData('key_resp_2.duration', key_resp_2.duration);
        routineTimer.reset();
        }
    
    key_resp_2.stop();
    // the Routine "feedback" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var endMaxDurationReached;
var endMaxDuration;
var endComponents;
function endRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'end' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    endClock.reset();
    routineTimer.reset();
    endMaxDurationReached = false;
    // update component parameters for each repeat
    const { error: supabaseError } = await supabaseClient.from('psychojs_results').insert({
      session_id: sessionId,
      trials: psychoJS._experiment._trialsData
    });
    if (supabaseError) {
      console.error('Supabase insert failed:', supabaseError);
    }
    psychoJS.experiment.addData('end.started', globalClock.getTime());
    endMaxDuration = null
    // keep track of which components have finished
    endComponents = [];
    
    endComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
       });
    return Scheduler.Event.NEXT;
  }
}


function endRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'end' ---
    // get current time
    t = endClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    endComponents.forEach( function(thisComponent) {
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
      }
    });
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function endRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'end' ---
    endComponents.forEach( function(thisComponent) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    });
    psychoJS.experiment.addData('end.stopped', globalClock.getTime());
    // the Routine "end" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


function importConditions(currentLoop) {
  return async function () {
    psychoJS.importAttributes(currentLoop.getCurrentTrial());
    return Scheduler.Event.NEXT;
    };
}


async function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }
  psychoJS.window.close();
  psychoJS.quit({message: message, isCompleted: isCompleted});
  
  return Scheduler.Event.QUIT;
}
