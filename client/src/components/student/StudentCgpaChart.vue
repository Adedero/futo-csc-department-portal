<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  results: { type: Array }
})

const sortedResults = computed(() => {
  return props.results.toSorted((a, b) => {
    if (parseInt(a.session.split('-')[0]) === parseInt(b.session.split('-')[0])) {
      return a.semester.localeCompare(b.semester)
    }

    return parseInt(a.session.split('-')[0]) - parseInt(b.session.split('-')[0])
  })
})

const chartData = ref()
const chartOptions = ref()
const labels = computed(() => {
  return sortedResults.value.map((result) => {
    return `${result.level}L: ${result.semester[0]}`
  })
})

const dataset = computed(() => {
  return sortedResults.value.map((result) => result.GPA)
})

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement)

  return {
    labels: labels.value,
    datasets: [
      {
        label: 'GPA',
        data: dataset.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue('--p-indigo-500'),
        tension: 0.4
      }
    ]
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    }
  }
}

onMounted(() => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})
</script>

<template>
  <div style="height: calc(100dvh - 28rem)" class="w-full overflow-x-auto">
    <Chart type="line" :data="chartData" :options="chartOptions" class="h-full min-w-96" />
  </div>
</template>
