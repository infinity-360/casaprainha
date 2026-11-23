import '@fontsource-variable/jost/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/secoes.css';
import './sections/carga.css';
import './sections/nav.css';
import './sections/voo.css';
import './sections/folha.css';
import './sections/casas.css';
import './sections/visita.css';
import './sections/rodape.css';

import { voo } from './motion/voo.js';
import { carga } from './motion/carga.js';
import { nav } from './motion/nav.js';
import { entradas } from './motion/entradas.js';
import { form } from './motion/form.js';
import { barra } from './motion/barra.js';

carga(voo());
nav();
entradas();
form();
barra();
