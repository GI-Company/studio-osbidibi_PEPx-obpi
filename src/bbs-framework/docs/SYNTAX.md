# BBS (BinaryBlocksphere) Framework Syntax Documentation (Conceptual)

This document outlines the conceptual syntax for the various file types used within the BBS Framework. This framework is designed for a highly dynamic and potentially AI-assisted development environment.

**Core File Types:**

*   **`.bbs` (BBS Application Launcher):** Manifest file for a BBS application. (JSON-like structure)
*   **`.fold` (Framework Object Layout Definition):** Defines main structure, layout, and hierarchy.
*   **`.if` (Inner Fold - Content):** Defines detailed content for sections using symbol-based syntax.
*   **`.pxr` (Pixelative Extended Reality):** Defines visual presentation, styling, layout, and animations (CSS-like with BBS extensions).
*   **`.pmf` (Pixelative Manipulated Flow):** Defines interactive flows, event handling, and dynamic content manipulation.
*   **`.efb` (External Frontend Bridge):** Conceptual bridge between frontend and host/BBS environment (e.g., Electron IPC, Web APIs).
*   **`.ifb` (Internal Backend Bridge):** Conceptual bridge for backend logic and core BBS services.
*   **`.edb` (External Rendering Bot Definition):** Natural language input for AI to generate frontend files (`.fold`, `.if`, `.pxr`, `.pmf`).
*   **`.idb` (Internal Rendering Bot Definition):** Natural language input for AI to generate backend/internal logic or `.ifb` services.

---

## 1. `.fold` (Framework Object Layout Definition) Files

**Purpose:** High-level structure and layout orchestration.

**Syntax Concepts:**

*   **Header (Optional):**
    *   `appName: "Your App Name"` (Sets/overrides window title)
    *   `defaultPXR: "path/to/styles.pxr"` (Global PXR styles for this fold)

*   **Root Layout Definition String:**
    *   Format: `'ScreenLayout,FixedFluid,Height,Width,DisplayType-${self_or_root_id, child_source1.if, child_source2.fold, ...}'`
    *   **`ScreenLayout`**: `FullScreen`, `SplitHorizontal`, `SplitVertical`, `Grid[rows,cols]`, `Tabs`
        *   Example: `Grid[2,3]` for a 2-row, 3-column grid.
    *   **`FixedFluid`**: Defines behavior of children.
        *   `Fixed`: Children have fixed sizes.
        *   `Fluid`: Children adapt to available space.
        *   `FixedFluid[index1,index3]`: Specific children are fixed, others fluid.
    *   **`Height` / `Width`**: `100vh`, `100vw`, `auto`, `Npx`, `N%` (for the root container of this fold).
    *   **`DisplayType`**: `FlexColumn`, `FlexRow`, `GridAutoFlowRow`, `GridAutoFlowColumn`, `Static`
        *   Hints at how children are arranged. Details often in accompanying PXR.
    *   **`-${content_sources}`**: Defines children in order of appearance.
        *   `self` or an ID: Refers to properties defined directly in this `.fold` for the container itself.
        *   `filename.if`: Includes content from an Inner Fold file.
        *   `filename.fold`: Nests another Fold structure.
        *   `ComponentName`: A predefined BBS component.

*   **Direct Properties / Basic Content (within the .fold file, less common):**
    *   `#element_id { property: value; ... }` (Basic PXR-like overrides, mainly for the container itself)
    *   `!Direct text content for an element!` (If an element is defined directly)

*   **Dynamic Placeholders / Component References:**
    *   `DYNAMIC_MODULE_LOADER { id: "loader_id"; targetContainerIdFromFold: "main_area"; defaultModuleFold: "dashboard.fold"; }`
        *   Used for loading different sub-layouts/modules dynamically.

**Example `.fold` Snippet:**

```fold
// Header
appName: "Main Application Window"
defaultPXR: "themes/main_theme.pxr"

// Root Layout: Top bar fixed, main content fluid, sidebar fixed
'FullScreen,FixedFluidFixed[0,2],100vh,100vw,FlexColumn-${app_container, top_bar_content.if, main_layout.fold, status_bar_content.if}'

// 'main_layout.fold' might be:
// 'Fluid,1fr,auto,FlexRow-${main_content_area, primary_sidebar.if}'
// (This shows nesting of .fold files)
```

---

## 2. `.if` (Inner Fold - Content Definition) Files

**Purpose:** Detailed content definition using a specialized symbol-based syntax.

**Syntax Symbols & Concepts (Based on User Prompt and Extended):**

*   **Header (Optional):**
    *   `ContextID: unique_id_for_this_content_block` (Links to a placeholder in a `.fold` file)
    *   `DataSources: [ "ifb:service/endpoint1", "PAX:data/static_data.json" ]` (Sources for dynamic content)
    *   `DefaultPXR: "component_styles.pxr"` (Specific PXR for this .if content)

*   **`!` - Text Input:**
    *   `!This is literal text content!`
    *   Can be styled using PXR if it's part of a defined element.
    *   `!Title Text! -style_ref=title_style.pxr_class-` (Conceptual PXR class application)

*   **`@` - Context Placeholder / Section Title:**
    *   `@dynamic_username_placeholder@` (Resolved by PMF or data binding)
    *   `@SectionTitle: User Details@` (Defines a logical section or a title placeholder)

*   **`#` - Object Definition / Asset Path:**
    *   Format: `#element_id { property1: value; property2: value; ... }`
    *   `#logo_image { path: "PAX:images/logo.png"; shape: image; alt: "Company Logo"; size: 150px auto; }`
        *   `path`: Path to asset. `PAX:` prefix for BBS asset directory.
        *   `shape`: `image`, `icon`, `rectangle`, `circle`, `custom_svg_ref`.
        *   `color`: Theme variable or hex code.
        *   `size`: `Width Height` (e.g., `100px 50px`, `100% auto`).
        *   Other properties: `border`, `margin`, `padding`, `alt` (for images), `data_source` (for charts).

*   **`*` - Multi-line Text / List Items:**
    *   Each line starting with `*` is a separate paragraph or list item within a conceptual block.
    *   `*First line or item.`
    *   `*Second line or item.`
    *   `*Can be styled as a whole block using PXR.*`
    *   For naming menus/tabs: `*MenuName1* *MenuName2*` implies order.

*   **`•` - Container / Grouping / Layering:**
    *   `• ...content... •` (Defines a container or a group of elements)
    *   Layering (images):
        *   `• #img_bg {path:"bg.png"}; + #img_fg {path:"fg.png"}; - #img_far_bg {path:"far_bg.png"} •`
        *   `+` for on top, `-` for behind. Multiple `+`/`-` for explicit z-index.
    *   Layout within a container (e.g., grid-like as per user example):
        *   `• // Container for a 2-col layout`
        *     `• !Item 1 Left! • // First column element`
        *     `• !Item 2 Right! • // Second column element`
        *   `•`
        *   (Actual grid/flex layout defined in PXR, `•` just groups items for that layout)

*   **`-` - Definition / Variable Assignment / CSS-like Property:**
    *   `-element_meaning = This element displays user statistics.-`
    *   `-max_widget_height = {300px}-` (Defines a variable or applies a direct style)
    *   `-style_ref = my_custom_pxr_class-` (Applies a PXR class to the current/next element)

*   **`{}` - Variable / Dynamic Content / Object Population:**
    *   `{dynamic_data_placeholder}` (Placeholder for data from `DataSources`)
    *   `{list_container_id} {list_item_template.if} {object_type1, object_type2}`
        *   Populates `list_container_id` using `list_item_template.if` for each item of `object_type1` or `object_type2` found in a data source.

*   **`[]` - Button Text:**
    *   `[Click Me]`

*   **`()` - Button Properties / Actions / Asset References (Complex Button Syntax):**
    *   Format: `( (prop1: val1) (prop2: val2) (action: "action_name") (target: "target_id") (icon: "PAX:icon.svg") (styleClass: "pxr_class_name") (W°width/button) (H°height/button) )`
    *   `[(Button Text)] ( (action: "submit_form") (targetForm: "login_form_id") (styleClass: "primary_button") (W°120px/button) )`
    *   `get.PXfrom.assetsname(AssetName)`: `(icon: "get.PXfrom.assetsname(my_icon)")` to fetch from PAX.
    *   Actions like `"launch_app"`, `"open_vfs_path"`, `"show_image_popover"` would be defined/handled in `.pmf` files.

**Example `.if` Snippet:**

```if
ContextID: user_profile_display
DataSources: [ "ifb:user/getProfileDetails/{userId_param}" ]

@SectionTitle: User Profile@

#profile_avatar { path: "{profileData.avatarUrl}"; shape: circle; size: 100px 100px; }

*Name: {profileData.fullName}*
*Email: {profileData.email}*
*Joined: {profileData.joinDate}*

[Edit Profile] ( (action: "navigate_to_edit_profile") (userId: "{profileData.id}") (styleClass: "edit_button") )
```

---

## 3. `.pxr` (Pixelative Extended Reality - Styling/Layout) Files

**Purpose:** CSS-like styling, layout rules, and animation definitions.

**Syntax Concepts:**

*   **Header (Optional):**
    *   `TargetScope: global | component_id_prefix | admin_theme`
    *   `Version: 1.0`
    *   `BaseThemeImport: "path/to/base_styles.pxr"` (Importing other PXR files)

*   **Selectors:**
    *   `#element_id { ... }` (ID selector)
    *   `.class_name { ... }` (Class selector)
    *   `element_type { ... }` (Type selector, e.g., `button`, `text_block`)
    *   `$layout_id_from_fold { ... }` (Selector for layouts defined in `.fold`)

*   **Properties (CSS-like with BBS extensions):**
    *   `color: {var_text_primary};`
    *   `background-color: #RRGGBB | {var_theme_color} | gradient(...);`
    *   `font-size: 16px | 1.2em | {var_font_size_medium};`
    *   `padding: 10px | 5px 10px;`
    *   `border-radius: 5px;`
    *   `display: flex | grid | block | inline-block;`
    *   `flex-direction: row | column;`
    *   `align-items: center | flex-start;`
    *   `box-shadow: 0 2px 5px {rgba(0,0,0,0.2)};`
    *   `transition: property duration timing-function delay;`
    *   `backdrop-filter: blur(Npx) saturate(N%);` (For glassmorphism)

*   **BBS Theme Variables:**
    *   `{var_variable_name}` (e.g., `{var_accent_color}`, `{var_standard_padding}`)
    *   Variables defined in a global theme PXR or at the root of a PXR file.
    *   `:root { var_accent_color: #28a745; }`

*   **Pseudo-classes & Elements:**
    *   `&:hover { ... }`
    *   `&:active { ... }`
    *   `&:focus { ... }`
    *   `&::before { ... }`, `&::after { ... }`

*   **Animation Definitions:**
    *   `@animation animation_name { from { ... } to { ... } }`
    *   `@animation pulse_glow { 0% { opacity: 1; box-shadow: none; } 50% { opacity: 0.7; box-shadow: 0 0 15px {var_primary_color}; } 100% { opacity: 1; box-shadow: none; } duration: 2s; timing-function: ease-in-out; iteration-count: infinite; }`
    *   Properties: `duration`, `timing-function`, `delay`, `iteration-count`, `direction`, `fill-mode`.

*   **Layout Definitions (for `$layout_id` selectors):**
    *   `$my_flex_container_layout { display: flex; flex-direction: column; gap: 10px; }`

*   **Extending Styles (Conceptual):**
    *   `.my_button { @extend .base_button_style; background-color: {var_special_button_bg}; }`

**Example `.pxr` Snippet:**

```pxr
TargetScope: global
BaseThemeImport: "themes/variables.pxr"

.primary_button_style {
  background-color: {var_primary_color};
  color: {var_primary_text_color};
  padding: 8px 16px;
  border-radius: {var_default_radius};
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover { background-color: {darken(var_primary_color, 10%)}; }
}

#main_app_container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: {var_app_background};
}

@animation fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0px); }
  duration: 0.5s;
  timing-function: ease-out;
}
```

---

## 4. `.pmf` (Pixelative Manipulated Flow) Files

**Purpose:** Event handling, interactive logic, data binding, and animation control.

**Syntax Concepts:**

*   **Header (Optional):**
    *   `TargetFold: path/to/target.fold` (The main `.fold` this PMF is associated with)
    *   `TargetSection: section_id_in_fold` (Optional, to scope PMF to a part of the fold)
    *   `Version: 1.0`
    *   `AccessLevel: public | private_internal`

*   **Event Listener Block:**
    *   `@ '<event_name>' on '<element_id_or_selector>' [filter: <condition>]`
        *   `event_name`: `click`, `mouseEnter`, `load`, `inputChange`, `submit`, `custom_event`.
        *   `element_id_or_selector`: ID from `.fold`/`.if` or a class selector.
        *   `filter`: Optional condition for the event to trigger the action.
    *   `? <event_params_or_payload_mapping>`
        *   Maps event data to variables, e.g., `(value: event.target.value, id: event.target.dataset.itemId)`.
    *   `¿ ... actions ... ¿` (Block of actions to perform)

*   **Actions (within `¿ ... ¿` block):**
    *   **UI Manipulation:**
        *   `UPDATE_CONTENT '<element_id>' with <"literal_string" | \`template_string_\${variable}\` | content_from_if_template("template.if", data_object)>`
        *   `SHOW_ELEMENT '<element_id>' [with_animation: "fadeIn"]`
        *   `HIDE_ELEMENT '<element_id>' [with_animation: "fadeOut"]`
        *   `TOGGLE_CLASS '<element_id>' class_name: "active_state_class.pxr"`
        *   `SET_ATTRIBUTE '<element_id>' attribute: "disabled" value: <true_false_or_string>`
        *   `DISPLAY_POPOVER { title: "Title", contentRef: "popover_content.if", size: {w,h}, anchorTo: "element_id" }`
        *   `NAVIGATE_TO_FOLD "new_screen.fold" [with_params: {key:val}]`
    *   **Data Operations:**
        *   `FETCH_DATA "efb:<bridge_function>" [with_payload: {data}] THEN (response) => { ...nested_actions... } CATCH (error) => { ...error_actions... }`
        *   `SAVE_DATA "ifb:<bridge_function>" with_data: {data_to_save} THEN ... CATCH ...`
        *   `SET_LOCAL_STATE variable_name = <value_or_expression>`
        *   `GET_LOCAL_STATE variable_name`
    *   **Logic & Control Flow:**
        *   `IF <condition_expression> THEN { ...actions... } [ELSE IF <condition> THEN { ...actions... }] [ELSE { ...actions... }] ENDIF`
        *   `VALIDATE_INPUT <variable_or_element_value> against_rule "rule_name_defined_elsewhere"`
        *   `LOOP_OVER <data_array_variable> AS item_variable DO { ...actions_using_item... } ENDLOOP`
    *   **Logging & Debugging:**
        *   `LOG_TO_CONSOLE <message_or_variable>`
        *   `LOG_ERROR <message_or_variable>`
    *   **Animation Control:**
        *   `PLAY_ANIMATION '<animation_name_from_pxr>' on_target '<element_id>' [params: {duration_override, delay}]`
        *   `STOP_ANIMATION '<animation_name_from_pxr>' on_target '<element_id>'`
    *   **Custom Event Dispatch:**
        *   `DISPATCH_CUSTOM_EVENT "my_custom_event_name" [with_detail: {key:val}]`

*   **Expressions & Variables:**
    *   `event.target.value`, `local_state_variable`, simple arithmetic, string concatenation.
    *   Boolean logic: `&&`, `||`, `!`, `==`, `!=`, `>`, `<`.

**Example `.pmf` Snippet:**

```pmf
TargetFold: "dashboard.fold"

@ 'click' on 'login_button'
? (username: getElementValue('username_input'), password: getElementValue('password_input'))
¿
  FETCH_DATA "efb:auth/login" with_payload: { username: username, password: password }
  THEN (response) => {
    IF response.success THEN
      NAVIGATE_TO_FOLD "user_home.fold"
    ELSE
      UPDATE_CONTENT 'error_message_display' with response.errorMessage
      SHOW_ELEMENT 'error_message_display'
    ENDIF
  }
  CATCH (networkError) => {
    LOG_ERROR `Login network error: ${networkError}`
    UPDATE_CONTENT 'error_message_display' with "Network error during login."
  }
¿

@ 'load' on 'user_profile_widget_in_dashboard_fold'
¿
  FETCH_DATA "efb:user/getProfile"
  THEN (profile) => {
    UPDATE_CONTENT 'username_display_element' with profile.name
    // ... more updates
  }
¿
```

---

This conceptual syntax aims to be declarative and integrate different aspects of UI (structure, content, style, behavior) into a cohesive framework. A real implementation would require a sophisticated parser, runtime engine, and tight integration between these file types.
