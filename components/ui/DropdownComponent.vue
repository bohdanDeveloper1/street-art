<script setup lang="ts">
interface Props {
  placement?: 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
})

const isOpen = ref<boolean>(false)
</script>

<template>
  <!--  <div>-->
  <!--    <DropdownComponent>-->
  <!--      <template #default>-->
  <!--        Show other dates-->
  <!--        </template>-->
  <!--        <template #dropdown>-->
  <!--          dates list-->
  <!--        </template>-->
  <!--    </DropdownComponent>-->
  <!--  </div>-->
  <div class="dropdown-wrapper">
    <slot name="default"/>
    <div
        class="dropdown-component-cover"
        @click="isOpen = !isOpen"
    />
    <div
        class="dropdown-component-content"
        v-if="isOpen"
    >
      <slot name="dropdown"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dropdown-wrapper{
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.dropdown-component-cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
}

.dropdown-component-content {
  position: absolute;
  z-index: 999999;
  overflow: hidden;
}
</style>
