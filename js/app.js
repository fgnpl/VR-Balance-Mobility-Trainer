import {loadRuntime} from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // For typedoc

loadRuntime('WonderlandRuntime-physx-threads', {threads: false}).then((runtime) => {
    runtime.start();
});