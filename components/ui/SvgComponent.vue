<script setup lang="ts">
interface Props {
  width?: number
  height?: number
  fontSize?: number
  svgFill?: string
  pathFill?: string
  svgName: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 24,
  height: 24,
  fontSize: 14,
  svgFill: 'none',
  pathFill: 'dimgray',
})
</script>

<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="width + 'px'"
      :height="height + 'px'"
      :fill="svgFill"
      viewBox="0 0 24 24"
  >
    <path :fill="pathFill" :d="svgName"/>
  </svg>
</template>

<style scoped lang="scss">
  //svg{
  //  &:hover{
  //    path{
  //      fill: black;
  //    }
  //  }
  //}
</style>