/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import TWProjectMetaFetcherHOC from '../lib/tw-project-meta-fetcher-hoc.jsx';
import { compose } from 'redux';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import TWStateManagerHOC from '../lib/tw-state-manager-hoc.jsx';
import TWPackagerIntegrationHOC from '../lib/tw-packager-integration-hoc.jsx';
import SettingsStore from '../addons/settings-store-singleton';
import '../lib/tw-fix-history-api';
import GUI from '../containers/gui.jsx';
import AddonChannels from '../addons/channels';
import { loadServiceWorker } from './load-service-worker';
import runAddons from '../addons/entry';
import ProjectFetcherHOC from "../lib/project-fetcher-hoc.jsx"
// const handleClickAddonSettings = addonId => {
//     // addonId might be a string of the addon to focus on, undefined, or an event (treat like undefined)
//     const path = process.env.ROUTING_STYLE === 'wildcard' ? 'addons' : 'addons.html';
//     const url = `${process.env.ROOT}${path}${typeof addonId === 'string' ? `#${addonId}` : ''}`;
//     window.open(url);
// };


if (AddonChannels.reloadChannel) {
    AddonChannels.reloadChannel.addEventListener('message', () => {
        location.reload();
    });
}

if (AddonChannels.changeChannel) {
    AddonChannels.changeChannel.addEventListener('message', e => {
        SettingsStore.setStoreWithVersionCheck(e.data);
    });
}

runAddons();


class Interface extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isLoading && !this.props.isLoading) {
            loadServiceWorker();
        }
    }

    render() {
        return (
            <GUI
                cloudHost={this.props.cloudHost ?? "wss://clouddata.turbowarp.org"}
                canUseCloud
                canModifyCloudData
                hasCloudPermission

                basePath={process.env.ROOT}

                backpackVisible
                backpackHost="_local_"

                {...this.props}
                onClickAddonSettings={() => { }}
            />
        );
    }
}

const WrappedInterface = compose(
    AppStateHOC,
    ErrorBoundaryHOC('TW Interface'),
    TWProjectMetaFetcherHOC,
    ProjectFetcherHOC,
    TWStateManagerHOC,
    TWPackagerIntegrationHOC
)(Interface);

export default WrappedInterface;