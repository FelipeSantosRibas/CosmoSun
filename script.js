/**
 * CosmoSun — script.js
 * Lógica de cálculo fotovoltaico + gráficos Chart.js
 */

const DEFAULTS = {
  potenciaPainel: 550,
  pr: 0.8,
  precoPainel: 1200,
  custoInstalacao: 5000,
  contaMinima: 50,
};

let chartPaineis = null;
let chartPayback = null;
let cidades = [];

const $ = (id) => document.getElementById(id);

const inputs = {
  potenciaPainel:  $('potenciaPainel'),
  pr:              $('pr'),
  precoPainel:     $('precoPainel'),
  custoInstalacao: $('custoInstalacao'),
  contaMinima:     $('contaMinima'),
  cidade:          $('cidade'),
  consumoMensal:   $('consumoMensal'),
  contaEnergia:    $('contaEnergia'),
};

document.addEventListener('DOMContentLoaded', () => {
  carregarCidades();
  $('btnReset').addEventListener('click', restaurarPadroes);
  $('btnCalcular').addEventListener('click', calcular);
});

async function carregarCidades() {
  try {
    const res = await fetch('cidades.json');
    if (!res.ok) throw new Error('Erro ao carregar cidades.json');
    cidades = await res.json();
    const sel = inputs.cidade;
    sel.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = ''; ph.disabled = true; ph.selected = true;
    ph.textContent = 'Selecione uma cidade...';
    sel.appendChild(ph);
    cidades.forEach((c, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = c.nome;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    inputs.cidade.innerHTML = '<option disabled selected>Erro ao carregar cidades</option>';
  }
}

function restaurarPadroes() {
  inputs.potenciaPainel.value  = DEFAULTS.potenciaPainel;
  inputs.pr.value              = DEFAULTS.pr;
  inputs.precoPainel.value     = DEFAULTS.precoPainel;
  inputs.custoInstalacao.value = DEFAULTS.custoInstalacao;
  inputs.contaMinima.value     = DEFAULTS.contaMinima;
  const btn = $('btnReset');
  btn.textContent = '✓ Valores restaurados!';
  setTimeout(() => { btn.textContent = '↺ Restaurar valores padrão'; }, 2000);
}

function calcular() {

  if (chartPaineis) {
    chartPaineis.destroy();
    chartPaineis = null;
  }

  if (chartPayback) {
    chartPayback.destroy();
    chartPayback = null;
  }

  const cidadeIdx      = parseInt(inputs.cidade.value);
  const consumoMensal  = parseFloat(inputs.consumoMensal.value);
  const contaEnergia   = parseFloat(inputs.contaEnergia.value);
  const potenciaPainel = parseFloat(inputs.potenciaPainel.value);
  const pr             = parseFloat(inputs.pr.value);
  const precoPainel    = parseFloat(inputs.precoPainel.value);
  const custoInstalacao= parseFloat(inputs.custoInstalacao.value);

  if (isNaN(cidadeIdx) || cidadeIdx < 0 || cidadeIdx >= cidades.length) {
    alertaValidacao('Selecione uma cidade antes de calcular.'); return;
  }
  if (isNaN(consumoMensal) || consumoMensal <= 0) {
    alertaValidacao('Informe um consumo mensal válido (> 0 kWh).'); return;
  }
  if (isNaN(contaEnergia) || contaEnergia <= 0) {
    alertaValidacao('Informe uma conta de energia média válida (> 0 R$).'); return;
  }
  if (isNaN(potenciaPainel) || potenciaPainel <= 0) {
    alertaValidacao('Potência do painel deve ser maior que 0 W.'); return;
  }
  if (isNaN(pr) || pr <= 0 || pr > 1) {
    alertaValidacao('O índice de desempenho (PR) deve estar entre 0 e 1.'); return;
  }

  const cidade      = cidades[cidadeIdx];
  const irradiacao  = cidade.irradiacao;
  const potenciaKW  = potenciaPainel / 1000;
  const geracaoPainel  = potenciaKW * irradiacao * 30 * pr;
  const quantidade     = Math.ceil(consumoMensal / geracaoPainel);
  const geracaoTotal   = quantidade * geracaoPainel;
  const excedente      = geracaoTotal - consumoMensal;

  const contaMinima = parseFloat(inputs.contaMinima.value);
  const custoTotal = quantidade * precoPainel + custoInstalacao;
  const tarifaMedia = contaEnergia / consumoMensal;
  const energiaCompensada = Math.min(
    geracaoTotal,
    consumoMensal
  );
  let economiaMensal =
    energiaCompensada * tarifaMedia;
  // desconta a conta mínima
  economiaMensal = Math.max(
    0,
    economiaMensal - contaMinima
  );

// if (economiaMensal <= 0) {
//   alertaValidacao(
//     "A conta informada é menor ou igual à conta mínima. Não há economia suficiente para calcular o retorno."
//   );
//   return;
// }

  const payback =
    economiaMensal > 0
      ? Math.ceil(custoTotal / economiaMensal)
      : Infinity;

  exibirResultados({
    cidade, irradiacao, quantidade, geracaoTotal, excedente,
    custoTotal, economiaMensal, payback, geracaoPainel,
    tarifaMedia, precoPainel, custoInstalacao, consumoMensal,
    contaEnergia, potenciaPainel, pr,
  });
}

function exibirResultados(r) {
  const sec = $('resultados');
  sec.classList.remove('hidden');

  $('resultados-sub').textContent =
    `Análise para ${r.cidade.nome} · consumo de ${fmt(r.consumoMensal, 'kWh/mês')}`;

  $('kpi-paineis').textContent  = r.quantidade;
  $('kpi-geracao').textContent  = fmt(r.geracaoTotal, 'kWh/mês');
  $('kpi-economia').textContent = fmtBRL(r.economiaMensal) + '/mês';
  $('kpi-custo').textContent    = fmtBRL(r.custoTotal);
  $('kpi-payback').textContent =
  isFinite(r.payback)
    ? `${r.payback} meses`
    : 'Não calculável';

  const excCard  = $('kpi-card-excedente');
  const excVal   = $('kpi-excedente');
  const excLabel = $('kpi-excedente-label');
  excCard.style.borderTop = '';
  excVal.style.color = '';

  if (r.excedente > 0) {
    excVal.textContent   = fmt(Math.abs(r.excedente), 'kWh/mês');
    excLabel.textContent = 'Excedente';
    excCard.style.borderTop = '3px solid #22A85A';
    excVal.style.color = '#22A85A';
  } else if (r.excedente < 0) {
    excVal.textContent   = fmt(Math.abs(r.excedente), 'kWh/mês');
    excLabel.textContent = 'Déficit';
    excCard.style.borderTop = '3px solid #E03F3F';
    excVal.style.color = '#E03F3F';
  } else {
    excVal.textContent   = '0 kWh/mês';
    excLabel.textContent = 'Equilibrado';
  }

  $('det-cidade').textContent          = r.cidade.nome;
  $('det-irradiacao').textContent      = `${r.irradiacao.toFixed(4)} kWh/m²/dia`;
  $('det-geracao-painel').textContent  = fmt(r.geracaoPainel, 'kWh/painel/mês');
  $('det-custo-paineis').textContent   = fmtBRL(r.quantidade * r.precoPainel);
  $('det-custo-instalacao').textContent= fmtBRL(r.custoInstalacao);

  renderizarGraficos(r);
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderizarGraficos(r) {
  // Gráfico 1: Painéis × Geração
  const maxPaineis = Math.max(r.quantidade + 4, 10);
  const labPaineis = Array.from({ length: maxPaineis }, (_, i) => i + 1);
  const datGeracao = labPaineis.map((n) => parseFloat((n * r.geracaoPainel).toFixed(2)));

  if (chartPaineis) chartPaineis.destroy();
  chartPaineis = new Chart($('chartPaineis'), {
    type: 'bar',
    data: {
      labels: labPaineis,
      datasets: [
        {
          label: 'Geração mensal (kWh)',
          data: datGeracao,
          backgroundColor: labPaineis.map((n) =>
            n === r.quantidade ? 'rgba(245,161,0,.9)' : 'rgba(13,27,46,.18)'
          ),
          borderColor: labPaineis.map((n) =>
            n === r.quantidade ? '#F5A100' : 'rgba(13,27,46,.35)'
          ),
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'Consumo mensal (kWh)',
          data: labPaineis.map(() => r.consumoMensal),
          type: 'line',
          borderColor: '#E03F3F',
          borderDash: [5, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: baseChartOptions('Painéis', 'kWh/mês', `Qtd. ideal: ${r.quantidade}`),
  });

  // Gráfico 2: Payback
  const canvasPayback = $('chartPayback');
  const erroPayback = $('erroPayback');

  if (
    !isFinite(r.payback) ||
    isNaN(r.payback) ||
    r.economiaMensal <= 0
  ) {
      if (chartPayback) {
          chartPayback.destroy();
          chartPayback = null;
      }

      canvasPayback.classList.add('hidden');
      erroPayback.classList.remove('hidden');

      return;
  }
  canvasPayback.classList.remove('hidden');
erroPayback.classList.add('hidden');

  if (chartPayback) {
    chartPayback.destroy();
    chartPayback = null;
  }

 if (r.economiaMensal <= r.contaMinima) {

    canvasPayback.classList.add('hidden');

    erroPayback.textContent =
      'Não é possível calcular o retorno do investimento porque a economia mensal é menor ou igual à conta mínima de energia.';

    erroPayback.classList.remove('hidden');

    canvasPayback.style.display = 'none';

    erroPayback.classList.remove('hidden');

    return;
  }




  const totalMeses = r.payback + Math.round(r.payback * 0.5) + 6;
  const labMeses   = Array.from({ length: totalMeses + 1 }, (_, t) => t);
  const datLucro   = labMeses.map((t) =>
    parseFloat((r.economiaMensal * t - r.custoTotal).toFixed(2))
  );

  if (chartPayback) chartPayback.destroy();
  chartPayback = new Chart($('chartPayback'), {
    type: 'line',
    data: {
      labels: labMeses,
      datasets: [
        {
          label: 'Lucro acumulado (R$)',
          data: datLucro,
          borderColor: '#F5A100',
          borderWidth: 2,
          pointRadius: labMeses.map((t) => (t === r.payback ? 6 : 0)),
          pointBackgroundColor: '#F5A100',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: { target: { value: 0 }, above: 'rgba(34,168,90,.1)', below: 'rgba(224,63,63,.08)' },
          tension: 0.35,
        },
        {
          label: 'Break-even',
          data: labMeses.map(() => 0),
          borderColor: 'rgba(0,0,0,.15)',
          borderDash: [4, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...baseChartOptions('Meses', 'R$', `Payback: mês ${r.payback}`),
    },
  });

  
}

function baseChartOptions(xLabel, yLabel, titleText) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: {
          color: '#4A5A6E',
          font: { family: "'Inter', sans-serif", size: 11 },
          boxWidth: 10,
          padding: 12,
        },
      },
      title: {
        display: !!titleText,
        text: titleText,
        color: '#F5A100',
        font: { family: "'Inter', sans-serif", size: 11, weight: '700' },
        padding: { bottom: 8 },
      },
      tooltip: {
        backgroundColor: '#0D1B2E',
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
        titleColor: '#FFFFFF',
        bodyColor: 'rgba(255,255,255,.65)',
        padding: 10,
        cornerRadius: 7,
      },
    },
    scales: {
      x: {
        title: { display: !!xLabel, text: xLabel, color: '#8896A8', font: { size: 11 } },
        grid:  { color: 'rgba(0,0,0,.06)' },
        ticks: { color: '#8896A8', font: { size: 11 } },
      },
      y: {
        title: { display: !!yLabel, text: yLabel, color: '#8896A8', font: { size: 11 } },
        grid:  { color: 'rgba(0,0,0,.06)' },
        ticks: { color: '#8896A8', font: { size: 11 } },
      },
    },
  };
}

function fmt(val, unit) { return `${val.toFixed(2)} ${unit}`; }

function fmtBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function alertaValidacao(msg) {
  document.querySelectorAll('.alerta-validacao').forEach(el => el.remove());
  const div = document.createElement('div');
  div.className = 'alerta-validacao';
  div.textContent = msg;
  const form = document.querySelector('.calc-form');
  form.appendChild(div);
  setTimeout(() => div.remove(), 4000);
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
