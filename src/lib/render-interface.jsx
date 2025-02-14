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
import { compose } from 'redux';
import AppStateHOC from './app-state-hoc.jsx';
import ErrorBoundaryHOC from './error-boundary-hoc.jsx';
import TWStateManagerHOC from './tw-state-manager-hoc.jsx';
import TWPackagerIntegrationHOC from './tw-packager-integration-hoc.jsx';
import SettingsStore from '../addons/settings-store-singleton';
import './tw-fix-history-api';
import GUI from '../containers/gui.jsx';
import AddonChannels from '../addons/channels';
import { loadServiceWorker } from './load-service-worker.js';
import runAddons from '../addons/entry';
import ProjectFetcherHOC from "./project-fetcher-hoc.jsx"


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
            />
        );
    }
}

const WrappedInterface = compose(
    AppStateHOC,
    ErrorBoundaryHOC('TW Interface'),
    TWStateManagerHOC,
    TWPackagerIntegrationHOC
)(Interface);

export default WrappedInterface;