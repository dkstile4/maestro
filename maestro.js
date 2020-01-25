// @ts-check
import CombatTrack from "./modules/combat-track.js";
import HypeTrack from "./modules/hype-track.js";
import ItemTrack from "./modules/item-track.js";
import { migrationHandler } from "./modules/migration.js";
import { _addPlaylistLoopToggle, _onPreUpdatePlaylistSound } from "./modules/misc.js";
import { registerModuleSettings } from "./modules/settings.js";

/**
 * Orchestrates (pun) module functionality
 */
export default class Conductor {
    static begin() {
        Conductor._hookOnInit();
        Conductor._hookOnReady();
    }

    /**
     * Init Hook
     */
    static async _hookOnInit() {
        Hooks.on("init", () =>{
            game.maestro = {};
            Conductor._initHookRegistrations();
        });
    }

    /**
     * Ready Hook
     */
    static async _hookOnReady() {
        Hooks.on("ready", async () => {

            game.maestro.hypeTrack = new HypeTrack();
            game.maestro.itemTrack = new ItemTrack();
            game.maestro.combatTrack = new CombatTrack();

            if (game.maestro.hypeTrack) {
                game.maestro.hypeTrack._checkForHypeTracksPlaylist();
            }

            if (game.maestro.itemTrack) {
                game.maestro.itemTrack._checkForItemTracksPlaylist();
            }

            if (game.maestro.combatTrack) {
                game.maestro.combatTrack._checkForCombatTracksPlaylist();
            }

            //Set a timeout to allow the sheets to register correctly before we try to hook on them
            window.setTimeout(Conductor._readyHookRegistrations, 500);
            //Conductor._readyHookRegistrations();

            if (game.data.version >= "0.4.4" && game.user.isGM) {
                game.maestro.migration = {};
                migrationHandler();
            }
        });
    }

    /**
     * Init Hook Registrations
     */
    static _initHookRegistrations() {
        registerModuleSettings();
        Conductor._hookOnRenderPlaylistDirectory();
        Conductor._hookOnRenderCombatTracker();
    }

    /**
     * Ready Hook Registrations
     */
    static _readyHookRegistrations() {
        //Sheet/App Render Hooks
        Conductor._hookOnRenderActorSheet();
        Conductor._hookOnRenderItemSheet();
        
        Conductor._hookOnRenderChatMessage();

        

        //Pre-update Hooks
        Conductor._hookOnPreUpdatePlaylistSound();
        Conductor._hookOnPreUpdatePlaylist();

        //Update Hooks
        Conductor._hookOnUpdateCombat();
        //Conductor._hookOnUpdatePlaylist();

        // Delete hooks
        Conductor._hookOnDeleteCombat();
        
        
    }

    /**
     * PreUpdate Playlist Hook
     */
    static _hookOnPreUpdatePlaylist() {
        Hooks.on("preUpdatePlaylist", (playlist, update) => {
        });
    }

    /**
     * PreUpdate Playlist Sound Hook
     */
    static _hookOnPreUpdatePlaylistSound() {
        Hooks.on("preUpdatePlaylistSound", (playlist, playlistId, update) => {
            _onPreUpdatePlaylistSound(playlist, update);
        });
    }

    /**
     * PreCreate Chat Message Hook
     */
    static _hookOnPreCreateChatMessage() {
        Hooks.on("preCreateChatMessage", (messages, update, options) => {
            _onPreCreateChatMessage(messages, update, options);
        });
    }

    /**
     * Update Combat Hook
     */
    static _hookOnUpdateCombat() {
        Hooks.on("updateCombat", (combat, update) => {
            game.maestro.combatTrack._checkCombatTrack(combat, update);
            game.maestro.hypeTrack._checkHype(combat, update);
        });
    }

    /**
     * Delete Combat Hook
     */
    static _hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            game.maestro.combatTrack._stopCombatTrack(combat);
        });
    }
    
    /**
     * Render Actor SheetsHook
     */
    static _hookOnRenderActorSheet() {
        if(!game.user.isGM) {
            return;
        }

        Hooks.on("renderActorSheet", (app, html, data) => {
            game.maestro.hypeTrack._addHypeButton(app, html, data);
        });
       
    }

    /**
     * RenderChatMessage Hook
     */
    static _hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (message, html, data) => {
            game.maestro.itemTrack.chatMessageHandler(message, html, data);
        })
    }

    /**
     * RenderPlaylistDirectory Hook
     */
    static _hookOnRenderPlaylistDirectory() {
        Hooks.on("renderPlaylistDirectory", (app, html, data) => {
            _addPlaylistLoopToggle(app, html, data);
        });
    }

    /**
     * RenderCombatTracker Hook
     */
    static _hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html, data) => {
            CombatTrack._addCombatTrackButton(app, html, data);
        });
    }

    /**
     * Render Item Sheet Hook
     */
    static _hookOnRenderItemSheet() {
        if(!game.user.isGM) {
            return;
        }

        Hooks.on("renderItemSheet", (app, html, data) => {
            game.maestro.itemTrack._addItemTrackButton(app, html, data);
        });
        
    }
}

/**
 * Tap, tap, tap, ahem
 * Shall we begin?
 * 
 * Initiates the module
 */
Conductor.begin();
