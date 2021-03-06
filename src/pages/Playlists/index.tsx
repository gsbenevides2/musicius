// eslint-disable-next-line no-use-before-define
import React from 'react'
import { FlatList, View, Image, DeviceEventEmitter } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { List, Title, Subheading, FAB, IconButton } from 'react-native-paper'

import { useNavigation } from '@react-navigation/native'

import {
  useLoadFadedScreen,
  LoadFadedScreen
} from '../../components/LoadFadedScreen'
import PlaylistName, { usePlaylistName } from '../../modals/PlaylistName'
import { useDatabase } from '../../services/database'
import { usePlaylistsTable } from '../../services/database/tables/playlists'

interface Playlist {
  id: number
  name: string
}

interface PlaylistItemProps {
  data: Playlist
  onPress: (id: number) => void
  onDelete: (id: number) => void
}
type PropsIcon = {
  color: string
  style?: {
    marginRight: number
    marginVertical?: number | undefined
  }
}
const PlaylistItem: React.FC<PlaylistItemProps> = props => {
  const { id } = props.data
  function handleDelete() {
    props.onDelete(id)
  }
  function handlePress() {
    props.onPress(id)
  }
  const RightComponent = (iconProps: PropsIcon) => (
    <IconButton
      onPress={handleDelete}
      color={iconProps.color}
      style={{ ...iconProps.style, marginRight: 24 }}
      icon="delete"
    />
  )
  return (
    <List.Item
      onPress={handlePress}
      title={props.data.name}
      left={props => <List.Icon {...props} icon="playlist-music" />}
      right={RightComponent}
    />
  )
}

const PlaylistsScreen: React.FC = () => {
  const [playlists, setPlaylists] = React.useState<Playlist[]>()
  const database = useDatabase()
  const loadedScreen = useLoadFadedScreen()
  const playlistsTable = usePlaylistsTable(database)
  const createNewPlaylist = React.useCallback(
    async (name: string) => {
      loadedScreen.open()
      try {
        if (!name || !name.length) {
          return showMessage({
            message: 'Digite um nome valido.',
            type: 'danger'
          })
        }
        const id = await playlistsTable.create(name)
        const newPlaylist = { id, name }
        if (playlists) setPlaylists([...playlists, newPlaylist])
        else setPlaylists([newPlaylist])
        showMessage({
          message: 'Playlist criada com sucesso',
          type: 'success'
        })
      } catch (e) {
        showMessage({
          message: 'Ocorreu um erro.',
          type: 'danger'
        })
      } finally {
        loadedScreen.close()
      }
    },
    [playlists]
  )
  const playlistName = usePlaylistName()
  const navigation = useNavigation()
  const handleDeletePlaylist = React.useCallback(
    async (id: number) => {
      loadedScreen.open()
      try {
        await playlistsTable.delete(id)
        setPlaylists(playlists?.filter(playlist => playlist.id !== id))
        showMessage({
          type: 'success',
          message: 'Playlist deletada com sucesso.'
        })
      } catch (e) {
        showMessage({
          type: 'danger',
          message: 'Erro ao deletar playlist.'
        })
      } finally {
        loadedScreen.close()
      }
    },
    [playlists]
  )

  const handleToPlaylistScreen = React.useCallback((id: number) => {
    navigation.navigate('Playlist', { id })
  }, [])
  React.useEffect(() => {
    async function load() {
      const playlists = await playlistsTable.list()
      setPlaylists(playlists)
    }
    load()
    const subscription = DeviceEventEmitter.addListener(
      'update-playlists',
      load
    )
    return () => {
      DeviceEventEmitter.removeSubscription(subscription)
    }
  }, [])
  if (playlists === undefined) {
    return <View />
  } else if (playlists.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <Image
            resizeMode={'contain'}
            style={{ width: '80%', height: '80%' }}
            source={require('../../assets/no_data.png')}
          />
          <Title>Você ainda não tem playlists</Title>
          <Subheading>Clique no + e crie uma!</Subheading>
        </View>
        <LoadFadedScreen {...loadedScreen.props} />
        <PlaylistName
          visible={playlistName.visible}
          next={createNewPlaylist}
          close={playlistName.close}
        />
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0
          }}
          icon="plus"
          onPress={playlistName.open}
        />
      </View>
    )
  } else {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={playlists}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PlaylistItem
              data={item}
              onDelete={handleDeletePlaylist}
              onPress={handleToPlaylistScreen}
            />
          )}
        />
        <LoadFadedScreen {...loadedScreen.props} />
        <PlaylistName
          visible={playlistName.visible}
          next={createNewPlaylist}
          close={playlistName.close}
        />
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0
          }}
          icon="plus"
          onPress={playlistName.open}
        />
      </View>
    )
  }
}
export default PlaylistsScreen
